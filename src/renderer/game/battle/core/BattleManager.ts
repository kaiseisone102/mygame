// src/renderer/game/battle/core/BattleManager.ts

import { BattleInput } from "../../../../renderer/router/useCase/gameUseCase/battle/BattleInputUseCase";
import { delay } from "../../../../renderer/utils/delay";
import { BattleCommandId } from "../../../../shared/domain/battleCommandId";
import { SkillRepository } from "../../../../shared/master/battle/SkillRepository";
import { SkillPreset } from "../../../../shared/master/battle/type/SkillPreset";
import { BattleAction, BattlerSide, StrangeAction, TargetSpecifier } from "../../../../shared/type/battle/BattleAction";
import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { BattleResult, TargetType } from "../../../../shared/type/battle/TargetType";
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

    constructor(
        private battleLogFormatter: BattleLogFormatter,
        private skillRepository: SkillRepository
    ) {
        this.skillData = this.skillRepository.getAll();
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
        this.buildTurnOrder();
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

    isPlayer(actorId: number): boolean {
        return true;
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
                const input = await this.battlePort.requestCommand(actor.id, actor.name, this.battleState.enemies);// 敵は battleScene から 後に

                action = this.convertInputToAction(input);

                console.log("⚔Ally Action「", actor.name, "」=>", action)
                break;
            case BattlerSide.ENEMY:
                await delay(300); // 思考演出
                action = this.convertInputToAction(this.convertStrangeActToInput(AIActionResolver.decideAction(actor, this.battleState, this.skillData)));
                console.log("💀Enemy Action「", actor.name, "」=> ", action)
                break;
        }

        // 実行
        const results = await this.executeAction(action);
        // ログ生成
        this.logResults(results);

        TraitRunner.onTurnEnd(actor);

        this.checkBattleEnd();

        if (!this.battleState.finished) {
            this.advanceTurn();
        }

        return results;
    }

    /* =====================
        コマンド取得
    ===================== */

    async requestCommand(): Promise<BattleAction> {
        const actor = this.currentActor;

        // 敵なら即AI決定
        if (actor.side === BattlerSide.ENEMY) {
            await delay(300); // 思考演出
            return this.convertInputToAction(this.convertStrangeActToInput(AIActionResolver.decideAction(actor, this.battleState, this.skillData)));
        }

        // プレイヤーならUI待ち
        return new Promise<BattleAction>((resolve) => {
            if (!this.onCommandRequested) throw new Error("onCommandRequested not set");
            this.onCommandRequested?.(actor, resolve);
        });
    }

    // これは UI 側から注入するコールバック。(battleScene が持っている)
    onCommandRequested?: (actor: Battler, resolve: (action: BattleAction) => void) => void;

    /* =====================
        行動実行
    ===================== */

    private async executeAction(action: BattleAction): Promise<SkillResult[]> {

        const actor = this.findBattler(action.actorId);
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

        if (action.type !== BattleCommandId.ITEM) {

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
                return spec.enemyId
                    ? [this.findBattler(spec.enemyId)!].filter(b => b.alive)
                    : [];

            case TargetType.GROUP_ENEMY:
                return spec.ids.map(id => this.findBattler(id)).filter((b): b is Battler => !!b && b.alive);

            case TargetType.ALL_ENEMIES:
                return this.battleState.enemies.filter(b => b.alive);

            case TargetType.SINGLE_ALLY:
                return spec.actorId
                    ? [this.findBattler(spec.actorId)!].filter(b => b.alive)
                    : [];

            case TargetType.SELF_AND_SINGLE_ALLY:
                const self = this.currentActor;
                const ally = spec.actorId ? this.findBattler(spec.actorId) : undefined;
                return [self, ally].filter((b): b is Battler => !!b && b.alive);

            case TargetType.ALL_ALLIES:
                return this.battleState.allies.filter(b => b.alive);

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
            .sort((a, b) => b.baseStats.speed - a.baseStats.speed)
            .map(b => b.id);

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

    private findBattler(id: number): Battler | undefined {
        return [...this.battleState.allies, ...this.battleState.enemies].find(b => b.id === id);
    }

    private convertInputToAction(
        input: BattleInput
    ): BattleAction {
        const skill = this.skillRepository.get(input.skillId);

        if (!skill) throw new Error(`Skill not found}`);

        return {
            type: input.commandId,
            actorId: input.actorId,
            skill,
            target: this.buildTarget(input, skill),
        };
    }

    private buildTarget(
        input: BattleInput,
        skill: SkillPreset
    ): TargetSpecifier {

        switch (skill.targetType) {
            case TargetType.SINGLE_ENEMY:
                return {
                    type: TargetType.SINGLE_ENEMY,
                    enemyId: input.targetId,
                };

            case TargetType.SINGLE_ALLY:
                return {
                    type: TargetType.SINGLE_ALLY,
                    actorId: input.targetId,
                };

            case TargetType.ALL_ALLIES:
                return { type: TargetType.ALL_ALLIES };

            case TargetType.ALL_ENEMIES:
                return { type: TargetType.ALL_ENEMIES };

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
        this.battleState = initialBattleState;
        this.buildTurnOrder();
    }
    private convertStrangeActToInput(action: StrangeAction): BattleInput {
        return { commandId: action.commandId, actorId: action.actorId, actorName: action.actorName, skillId: action.skillId, enemy: [], targetId: this.currentActor.id }
    }
}
