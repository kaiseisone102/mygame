// src/renderer/game/battle/core/BattleManager.ts

import { AlliesStatusOverlay } from "../../../../renderer/screens/battleScene/overlayScreen/AlliesStatusOverlay";
import { BattleInput } from "../../../../renderer/router/useCase/gameUseCase/battle/BattleInputUseCase";
import { delay } from "../../../../renderer/utils/delay";
import { BattleCommandId } from "../../../../shared/domain/battleCommandId";
import { SkillRepository } from "../../../../shared/master/battle/SkillRepository";
import { SkillId, SkillPreset } from "../../../../shared/master/battle/type/SkillPreset";
import { BattleAction, BattlerSide, StrangeAction, TargetSpecifier } from "../../../../shared/type/battle/BattleAction";
import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { BattleResult, CommandActionType, TargetType } from "../../../../shared/type/battle/TargetType";
import { AIActionResolver } from "../enemy/ai/AIActionResolver";
import { BattleLogFormatter } from "../event/BattleLogFormatter";
import { SkillExecutor } from "../logic/skills/SkillExecutor";
import { TraitRunner } from "../logic/traits/TraitRunner";
import { BattlePort } from "../port/BattlePort";
import { Battler } from "./Battler";
import { BattleState, initialBattleState } from "./BattleState";
import { canBattlerAct } from "./canBattlerAct";
import { GetOverlayScreenType } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { BattleTurnDisplayOverlay } from "../../../../renderer/screens/battleScene/overlayScreen/BattleTurnDisplayOverlay";
import { OverlayScreenType } from "../../../../shared/type/screenType";

/**
 * 2026/02/09
 * BattleManager（ルール・進行）
 * 
 * [責務]
 */
export class BattleManager {
    private battleState!: BattleState;
    private battlePort!: BattlePort;
    private skillData: SkillPreset[];

    private alliesStatusOverlay: AlliesStatusOverlay;

    constructor(
        private battleLogFormatter: BattleLogFormatter,
        private skillRepository: SkillRepository,
        private overlay: GetOverlayScreenType
    ) {
        this.skillData = this.skillRepository.getAll();
        this.alliesStatusOverlay = this.overlay[OverlayScreenType.ALLIES_STATUS_OVERLAY];
    }

    init(state: BattleState) {
        this.battleState = state;
    }

    /* =====================
        外部公開（readonly）
     ===================== */

    setPort(battlePort: BattlePort) {
        this.battlePort = battlePort;
    }

    getBattlePort(): BattlePort {
        return this.battlePort;
    }

    getState(): Readonly<BattleState> {
        return this.battleState;
    }

    setState(state: BattleState) {
        this.battleState = state;
    }

    get currentActor(): Battler {
        const actorId = this.battleState.order[this.battleState.currentActorId];

        const actor = this.findBattler(actorId);
        if (!actor) {
            console.error("order:", this.battleState.order);
            console.error("allies:", this.battleState.allies);
            console.error("enemies:", this.battleState.enemies);
            throw new Error("Current actor not found");
        }
        return actor;
    }

    getCurrentActor(): Battler | null {
        const state = this.battleState;

        if (
            state.currentActorId < 0 ||
            state.currentActorId >= state.order.length
        ) {
            return null;
        }
        const actorId = state.order[state.currentActorId];
        return this.findBattler(actorId) ?? null;
    }

    isPlayer(actorInstanceId: number): boolean {
        const battler = this.findBattler(actorInstanceId);
        return battler?.side === BattlerSide.ALLY;
    }

    /* =====================
        メインループ用
    ===================== */

    async nextStep(): Promise<SkillResult[]> {
        if (this.battleState.finished) return [];

        const actor = this.currentActor;

        // ターン開始Trait
        TraitRunner.onTurnStart(actor);

        // 行動不能スキップ
        if (!canBattlerAct(actor)) {
            this.advanceTurn();
            return [];
        }

        let action: BattleAction;

        switch (actor.side) {
            case BattlerSide.ALLY:
                // usecase からUI入力を受け取る => action 生成
                const input = await this.battlePort.requestCommand(actor.templateId, actor.instanceId, actor.name, this.battleState.enemies);

                action = this.convertInputToAction(input);

                console.log("⚔Ally Action「", actor.name, "」=>", action)
                break;
            case BattlerSide.ENEMY:
                // 思考演出
                await delay(600);
                // 最適行動を目指す！ 
                const AIBestAction = AIActionResolver.decideAction(actor, this.battleState, this.convertSkillIdToSkillPreset(actor.skills));// actor.skillをskillPresetに変換
                console.log("AIBestAction:", AIBestAction);

                const AIBattleInput = this.convertStrangeActToInput(AIBestAction);
                console.log("AIBattleInput:", AIBattleInput);

                action = this.convertInputToAction(AIBattleInput);
                console.log("💀Enemy Action「", actor.name, "」=> ", action)
                break;
        }

        // 実行
        const results = await this.executeAction(action);

        // 行動後に味方のHP/MP更新
        this.alliesStatusOverlay.update(0);

        this.checkBattleEnd();

        if (!this.battleState.finished) {
            this.advanceTurn();
        }

        // ログ生成
        this.logResults(results);

        TraitRunner.onTurnEnd(actor);

        return results;
    }

    /* =====================
        行動実行
    ===================== */

    private async executeAction(action: BattleAction): Promise<SkillResult[]> {

        const actor = this.findBattler(action.actorInstanceId);
        if (!actor || !actor.alive) return [];

        // 状態異常による行動書き換え
        const rewriteCtx = {
            self: actor,
            allies: this.battleState.allies.filter(b => b.alive),
            enemies: this.battleState.enemies.filter(b => b.alive),
        };

        // 状態異常による行動書き換え
        for (const status of actor.statusEffects) {
            const reWrite = status.onRewriteAction?.(action, rewriteCtx);
            if (!reWrite) continue;
            action = this.convertInputToAction(this.convertStrangeActToInput(reWrite)) ?? action;
        }

        // 逃げる
        if (action.type === CommandActionType.ESCAPE) {

            const success = Math.random() < 0.7;

            if (success) {
                this.battlePort.addBattleLog(`${actor.name}は逃げ出した！`);
                await delay(1000);
                this.finish(BattleResult.ESCAPE);
            } else {
                this.battlePort.addBattleLog(`${actor.name}は逃げられなかった！`);
                await delay(600);
            }
            return [];
        }

        // Traitによる行動書き換え
        action = TraitRunner.beforeAction(actor, action);

        if (action.type !== CommandActionType.ITEM) {

            const skill = action.skill;
            if (!skill) throw new Error("BattleManager executeAction cant found action.skill");

            this.battlePort.addBattleLog(`${actor.name}は${skill.name}を使った！`);

            // 対象を解決
            const targets = this.resolveTargets(action.target ?? { type: TargetType.SELF });

            return SkillExecutor.execute(actor, skill, targets);
        }
        this.battlePort.addBattleLog(
            `${actor.name}は${action.skill.name}を使った！`
        );
        const targets = this.resolveTargets(action.target ?? { type: TargetType.SELF });
        return SkillExecutor.execute(actor, action.skill, targets);
    }

    /** 行動から対象の Battler 配列を返す */
    private resolveTargets(spec: TargetSpecifier): Battler[] {
        switch (spec.type) {
            case TargetType.SINGLE_ENEMY:
                return spec.enemyInstanceId
                    ? [this.findBattler(spec.enemyInstanceId)!].filter(b => b.alive)
                    : [];

            case TargetType.GROUP_ENEMY:
                return spec.ids.map(id => this.findBattler(id)).filter((b): b is Battler => !!b && b.alive);

            case TargetType.ALL_ENEMIES:
                const actor = this.findBattler(spec.actorInstanceId ?? this.currentActor.instanceId);
                if (!actor) return [];
                return actor.side === BattlerSide.ALLY
                    ? this.battleState.enemies.filter(b => b.alive)
                    : this.battleState.allies.filter(b => b.alive);

            case TargetType.SINGLE_ALLY:
                return spec.actorInstanceId
                    ? [this.findBattler(spec.actorInstanceId)!].filter(b => b.alive)
                    : [];

            case TargetType.SELF_AND_SINGLE_ALLY:
                const self = this.currentActor;
                const ally = spec.actorInstanceId ? this.findBattler(spec.actorInstanceId) : undefined;
                return [self, ally].filter((b): b is Battler => !!b && b.alive);

            case TargetType.ALL_ALLIES:
                const actor2 = this.findBattler(spec.actorInstanceId ?? this.currentActor.instanceId);
                if (!actor2) return [];
                return actor2.side === BattlerSide.ALLY
                    ? this.battleState.allies.filter(b => b.alive)
                    : this.battleState.enemies.filter(b => b.alive);

            case TargetType.SELF:
                return [this.currentActor];
        }
    }

    /* =====================
        ターン制御
    ===================== */

    private buildTurnOrder() {
        const all = [...this.battleState.allies, ...this.battleState.enemies];

        this.battleState.order = all
            .filter(b => b.alive)
            .sort((a, b) => (b.baseStats.speed + Math.random())
                - (a.baseStats.speed + Math.random()))
            .map(b => b.instanceId);

        this.battleState.currentActorId = 0;
    }

    private advanceTurn() {
        // 次のアクターへ
        this.battleState.currentActorId++;

        // ラウンド終了判定
        if (this.battleState.currentActorId >= this.battleState.order.length) {
            this.battleState.turn++;
            this.buildTurnOrder();
        }
    }

    startBattle() {
        this.buildTurnOrder();
        // 初期表示用
        if (this.alliesStatusOverlay) this.alliesStatusOverlay.show({ allies: this.battleState.allies });
    }

    /* =====================
        勝敗判定
    ===================== */

    private checkBattleEnd() {
        const alliesAlive = this.battleState.allies.some(a => a.alive);
        const enemiesAlive = this.battleState.enemies.some(e => e.alive);

        if (!enemiesAlive) {
            this.finish(BattleResult.WIN);
        } else if (!alliesAlive) {
            this.finish(BattleResult.LOSE);
        }
    }

    private finish(result: BattleResult) {
        this.battleState.finished = true;
        this.battleState.result = result;
    }

    /* =====================
        Utility
    ===================== */

    private findBattler(instanceId: number): Battler | undefined {
        return [...this.battleState.allies, ...this.battleState.enemies].find(b => b.instanceId === instanceId);
    }

    private convertInputToAction(input: BattleInput): BattleAction {
        const skill = this.skillRepository.get(input.skillId);

        if (!skill) throw new Error(`Skill not found}`);

        return {
            type: input.commandId,
            actorTemplateId: input.actorTemplateId,
            actorInstanceId: input.actorInstanceId,
            skill,
            target: this.buildTarget(input, skill),
        };
    }

    private convertSkillIdToSkillPreset(skillIds: SkillId[]): SkillPreset[] {
        return skillIds.map(id => this.skillRepository.get(id));
    }

    private buildTarget(
        input: BattleInput,
        skill: SkillPreset
    ): TargetSpecifier {

        switch (skill.targetType) {
            case TargetType.SINGLE_ENEMY:
                return {
                    type: TargetType.SINGLE_ENEMY,
                    enemyInstanceId: input.targetId,
                };

            case TargetType.SINGLE_ALLY:
                return {
                    type: TargetType.SINGLE_ALLY,
                    actorInstanceId: input.targetId,
                };

            case TargetType.ALL_ALLIES:
                return { type: TargetType.ALL_ALLIES, actorInstanceId: input.actorInstanceId };

            case TargetType.ALL_ENEMIES:
                return { type: TargetType.ALL_ENEMIES, actorInstanceId: input.actorInstanceId };

            case TargetType.SELF:
            default:
                return {
                    type: TargetType.SELF,
                };

        }
    }

    private logResults(results: SkillResult[]) {
        for (const result of results) {
            const source = this.findBattler(result.sourceId);
            const target = this.findBattler(result.targetId);

            if (!source || !target) continue;

            const logs = BattleLogFormatter.fromResult(result, source, target);
            logs.forEach(log => this.battlePort.addBattleLog(log));
        }
    }

    reset(): void {
        this.battleState = structuredClone(initialBattleState);
        this.buildTurnOrder();
        this.alliesStatusOverlay.hide();
    }

    private convertStrangeActToInput(action: StrangeAction): BattleInput {
        return {
            commandId: action.commandId,
            actorTemplateId: action.actorTemplateId,
            actorInstanceId: action.actorInstanceId,
            actorName: action.actorName,
            skillId: action.skillId,
            enemy: [],
            targetId: action.target ?? this.currentActor.instanceId
        }
    }

    /** process at finished combat */
    async checkBattleEndAfterStep(): Promise<BattleResult> {
        switch (this.battleState.result) {

            case BattleResult.WIN:
                this.battlePort.addBattleLog("敵を全滅させた！");
                await delay(1000);
                return BattleResult.WIN;

            case BattleResult.LOSE:
                this.battlePort.addBattleLog("味方が全滅した…");
                await delay(1000);
                return BattleResult.LOSE;

            case BattleResult.ESCAPE:
                return BattleResult.ESCAPE;

            default: return BattleResult.NULL;
        }
    }

    // 敵の合計経験値を計算
    public calculateExpGained(): number {
        return this.battleState.enemies.reduce((sum, enemy) => sum + (enemy.exp ?? 0), 0);
    }

    // 味方ごとに経験値を分配
    public calculateExpForAllies(): { instanceId: number, gainedExp: number }[] {
        const totalExp = this.calculateExpGained();
        const allies = this.battleState.allies;
        const perAlly = Math.floor(totalExp / allies.length);
        console.log("allies:", this.battleState.allies);
        console.log("enemies:", this.battleState.enemies);
        return allies.map(a => ({
            instanceId: a.instanceId,
            gainedExp: perAlly
        }));
    }
}
