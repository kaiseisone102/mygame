// src/renderer/game/battle/core/BattleManager.ts

import { SkillPreset } from "../../../../shared/master/battle/type/SkillPreset";
import { BattleInput } from "../../../../renderer/router/useCase/gameUseCase/battle/BattleInputUseCase";
import { delay } from "../../../../renderer/utils/delay";
import { SkillPresetsById } from "../../../../shared/master/battle/SkillPresets";
import { BattleAction, BattlerSide, TargetSpecifier } from "../../../../shared/type/battle/BattleAction";
import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { BattleResult, CommandActionType, TargetType } from "../../../../shared/type/battle/TargetType";
import { AIActionResolver } from "../enemy/ai/AIActionResolver";
import { BattleLogFormatter } from "../event/BattleLogFormatter";
import { SkillExecutor } from "../logic/skills/SkillExecutor";
import { TraitRunner } from "../logic/traits/TraitRunner";
import { BattlePort } from "../port/BattlePort";
import { Battler } from "./Battler";
import { BattleState } from "./BattleState";
import { canBattlerAct } from "./canBattlerAct";
import { BattleCommandId } from "../../../../shared/domain/battleCommandId";
import { BattleScenePayload } from "../../../../renderer/screens/battleScene/battleScene";
import { SkillRepository } from "../../../../shared/master/battle/SkillRepository";

/**
 * 2026/02/09
 * BattleManager（ルール・進行）
 * 
 * [責務]
 */
export class BattleManager {
    private battleState: BattleState;
    private battlePort!: BattlePort;

    constructor(
        private battleLogFormatter: BattleLogFormatter,
        private initialState: BattleState,
        private skillRepository: SkillRepository
    ) {
        this.battleState = this.initialState;
        this.buildTurnOrder();
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

    get currentActor(): Battler {
        const actor = this.battleState.order[this.battleState.currentActorId];
        if (!actor) throw new Error("Current actor not found");
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

        return state.order[state.currentActorId];
    }

    isPlayer(actorId: number): boolean {
        return true;
    }

    /* =====================
        メインループ用
    ===================== */

    async nextStep(payload: BattleScenePayload): Promise<SkillResult[]> {
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

                action = this.convertInputToAction(actor.id, input);

                console.log("⚔Ally Action「", actor.name, "」=>", action)
                break;
            case BattlerSide.ENEMY:
                await delay(300); // 思考演出
                action = AIActionResolver.decideAction(actor, this.battleState);
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
            return AIActionResolver.decideAction(actor, this.battleState);
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
            action = status.onRewriteAction?.(action, rewriteCtx) ?? action;
        }

        // Traitによる行動書き換え
        action = TraitRunner.beforeAction(actor, action);

        if (action.type !== BattleCommandId.ITEM) {
            // スキルを取得（攻撃、魔法、アイテムなど）
            const skillId = this.getSkillIdFromAction(action);
            if (!skillId) return [];

            const skill = SkillPresetsById[skillId];
            if (!skill) return [];

            this.battlePort.addBattleLog(
                `${actor.name}は${skill.name}を使った！`
            );

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

    /** 行動からスキルIDを決定 */
    private getSkillIdFromAction(action: BattleAction): string | undefined {
        switch (action.type) {
            case CommandActionType.ATTACK:
            case CommandActionType.MAGIC:
                return action.skillId;
            case CommandActionType.ITEM:
                return action.skill.id;
            case CommandActionType.DEFENCE:
            case CommandActionType.ESCAPE:
            default:
                return undefined;
        }
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
            .sort((a, b) => b.speed - a.speed);

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
        actorId: number,
        input: BattleInput
    ): BattleAction {
        if (input.commandId !== CommandActionType.ITEM) {
            const skillId = input.skillId;

            if (!skillId) {
                throw new Error("SkillId not provided");
            }

            const skill = SkillPresetsById[skillId];
            if (!skill) {
                throw new Error(`Skill not found: ${skillId}`);
            }
            return {
                type: input.commandId,
                actorId,
                skillId,
                target: this.buildTarget(input, skill),
            };
        }

        return {
            type: input.commandId,
            actorId,
            skill: input.skill,
            target: this.buildTarget(input, input.skill),
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
        this.battleState.finished = false;
        this.battleState.turn = 1;
        this.buildTurnOrder();
    }

}
