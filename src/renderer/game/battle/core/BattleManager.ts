// src/renderer/game/battle/core/BattleManager.ts

import { AppUIEvent } from "renderer/router/AppUIEvents";
import { BattleInput } from "../../../../renderer/router/useCase/gameUseCase/battle/BattleInputUseCase";
import { AlliesStatusOverlay } from "../../../../renderer/screens/battleScene/overlayScreen/AlliesStatusOverlay";
import { GetOverlayScreenType } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { delay } from "../../../../renderer/utils/delay";
import { SkillRepository } from "../../../../shared/master/battle/SkillRepository";
import { SkillId, SkillPreset } from "../../../../shared/master/battle/type/SkillPreset";
import { BattleAction, BattlerSide, StrangeAction, TargetSpecifier } from "../../../../shared/type/battle/BattleAction";
import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { SkillEffectKindId } from "../../../../shared/type/battle/skill/skillFormula";
import { BattleResult, CommandActionType, TargetType } from "../../../../shared/type/battle/TargetType";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { SkillItem } from "../../../screens/battleScene/overlayScreen/SkillSelectOverlay";
import { AIActionResolver } from "../enemy/ai/AIActionResolver";
import { BattleLogFormatter } from "../event/BattleLogFormatter";
import { SkillExecutor } from "../logic/skills/SkillExecutor";
import { TraitRunner } from "../logic/traits/TraitRunner";
import { BattlePort } from "../port/BattlePort";
import { Battler } from "./Battler";
import { BattleState, initialBattleState } from "./BattleState";
import { canBattlerAct } from "./canBattlerAct";

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

    private emitUI!: (event: AppUIEvent) => void;

    constructor(
        private battleLogFormatter: BattleLogFormatter,
        private skillRepository: SkillRepository,
        private overlay: GetOverlayScreenType,
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

                this.battlePort.addBattleLog(`${actor.name}のターン！`);

                // usecase からUI入力を受け取る => action 生成
                const skillItems: SkillItem[] = actor.skills.map(id => {
                    const sp = this.skillRepository.get(id);
                    return {
                        skillId: sp.id,
                        name: sp.name,
                        description: sp.description,
                        mpCost: sp.cost?.mp ?? 0,
                        target: {
                            type: sp.targetType,
                            side: sp.targetSide
                        }
                    };
                });
                const input = await this.battlePort.requestCommand(this.battleState.allies, this.battleState.enemies, skillItems);

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
                break;
        }

        // 実行
        const results = await this.executeAction(action);

        // special calls of combat-end
        this.processSpecialResults(results);

        // 行動後に味方のHP/MP更新
        this.emitUI({
            type: "UPDATE_STATUS", allies: {
                allies: this.battleState.allies.map(ally => ({
                    instanceId: ally.instanceId,
                    name: ally.name,
                    hp: ally.baseStats.hp,
                    maxHp: ally.baseStats.maxHp,
                    mp: ally.baseStats.mp,
                    maxMp: ally.baseStats.maxMp,
                }))
            }
        })
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

        this.battlePort.addBattleLog(`${actor.name}は${action.skill.name}を使った！`);

        const targets = this.resolveTargets(action.target ?? { type: TargetType.SELF });
        return SkillExecutor.execute(actor, action.skill, targets);
    }

    /** 行動から対象の Battler 配列を返す */
    private resolveTargets(spec: TargetSpecifier): Battler[] {

        // まず行動の主体（実行者）を特定する
        const executor = this.findBattler(spec.actorInstanceId ?? this.currentActor.instanceId);
        if (!executor) return [];

        // 実行者のサイドに基づいて「相手チーム」と「自分チーム」を定義
        const opponentSide = executor.side === BattlerSide.ALLY ? this.battleState.enemies : this.battleState.allies;
        const teamSide = executor.side === BattlerSide.ALLY ? this.battleState.allies : this.battleState.enemies;

        switch (spec.type) {
            case TargetType.SINGLE_ENEMY:
                // 敵単体：指定IDのバトラーが「生きている」かつ「相手チーム」にいるか
                if (!spec.enemyInstanceId) return [];
                const targetEnemy = this.findBattler(spec.enemyInstanceId);
                return (targetEnemy && targetEnemy.alive) ? [targetEnemy] : [];

            case TargetType.GROUP_ENEMY:
                // 指定されたIDリストのうち、相手チームに属するもの
                if (!spec.ids) return [];
                return spec.ids
                    .map(id => this.findBattler(id))
                    .filter((b): b is Battler => !!b && b.alive && b.side !== executor.side);

            case TargetType.ALL_ENEMIES:
                // 敵全体：相手チームの生存者全員
                return opponentSide.filter(b => b.alive);

            case TargetType.SINGLE_ALLY:
                // 味方単体：指定ID（または自分）が「生きている」かつ「自分チーム」にいるか
                const allyId = spec.actorInstanceId ?? executor.instanceId;
                const targetAlly = this.findBattler(allyId);
                return (targetAlly && targetAlly.alive) ? [targetAlly] : [];

            case TargetType.SELF_AND_SINGLE_ALLY:
                // 自分と味方単体
                const otherAlly = spec.actorInstanceId ? this.findBattler(spec.actorInstanceId) : undefined;
                return [executor, otherAlly].filter((b): b is Battler => !!b && b.alive);

            case TargetType.ALL_ALLIES:
                // 味方全体：自分チームの生存者全員
                return teamSide.filter(b => b.alive);

            case TargetType.SELF:
                return executor.alive ? [executor] : [];

            default:
                return [];
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

    startBattle(emitUI: (event: AppUIEvent) => void) {
        this.emitUI = emitUI
        this.buildTurnOrder();
        // 初期表示用
        if (this.alliesStatusOverlay) this.alliesStatusOverlay.show({
            allies: this.battleState.allies.map(ally => ({
                instanceId: ally.instanceId,
                name: ally.name,
                hp: ally.baseStats.hp,
                maxHp: ally.baseStats.maxHp,
                mp: ally.baseStats.mp,
                maxMp: ally.baseStats.maxMp,
            }))
        });
    }

    /* =====================
        勝敗判定
    ===================== */

    private checkBattleEnd() {

        if (this.battleState.finished) return;

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

        const actor = this.findBattler(input.actorInstanceId);
        const isActorEnemy = actor?.side === BattlerSide.ENEMY;

        switch (skill.targetType) {
            case TargetType.SINGLE_ENEMY:
                return {
                    type: TargetType.SINGLE_ENEMY,
                    actorInstanceId: input.actorInstanceId,
                    enemyInstanceId: input.targetId,
                };

            case TargetType.GROUP_ENEMY: {

                // 敵が使った場合は ALL_ENEMIES の処理へ横流しする
                if (isActorEnemy) {
                    return { type: TargetType.ALL_ENEMIES, actorInstanceId: input.actorInstanceId };
                }

                // 選択されたメインのターゲットを取得
                const mainTarget = this.findBattler(input.targetId);
                if (!mainTarget) return { type: TargetType.GROUP_ENEMY, actorInstanceId: input.actorInstanceId, ids: [] };

                // メインターゲットと同じ陣営（side）かつ、同じ種類（templateId）の生存者を抽出
                const targets = (mainTarget.side === BattlerSide.ALLY ? this.battleState.allies : this.battleState.enemies)
                    .filter(b => b.templateId === mainTarget.templateId && b.alive)
                    .map(b => b.instanceId);

                return {
                    type: TargetType.GROUP_ENEMY,
                    actorInstanceId: input.actorInstanceId,
                    ids: targets
                };
            }

            case TargetType.ALL_ENEMIES:
                return { type: TargetType.ALL_ENEMIES, actorInstanceId: input.actorInstanceId };

            case TargetType.SINGLE_ALLY:
                return {
                    type: TargetType.SINGLE_ALLY,
                    actorInstanceId: input.targetId ?? input.actorInstanceId,
                };

            case TargetType.ALL_ALLIES:
                return { type: TargetType.ALL_ALLIES, actorInstanceId: input.actorInstanceId };


            case TargetType.SELF:
            case TargetType.SELF_AND_SINGLE_ALLY:
            default:
                return {
                    type: TargetType.SELF,
                    actorInstanceId: input.actorInstanceId,
                };

        }
    }

    private logResults(results: SkillResult[]) {
        for (const result of results) {
            const battler = this.findBattler(result.instanceId);
            const target = this.findBattler(result.targetId);

            if (!battler || !target) continue;

            const logs = BattleLogFormatter.fromResult(result, battler, target);
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

    private processSpecialResults(results: SkillResult[]) {

        for (const r of results) {

            if (r.kind === SkillEffectKindId.ESCAPE && r.success) {
                this.finish(BattleResult.ESCAPE);
            }

        }
    }
}
