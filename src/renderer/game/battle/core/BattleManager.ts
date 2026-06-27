// src/renderer/game/battle/core/BattleManager.ts

import { SkillItem } from "../../../../shared/type/payload/battle";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { delay } from "../../../../renderer/utils/delay";
import { SkillRepository } from "../../../../shared/master/battle/SkillRepository";
import { StatusPresets } from "../../../../shared/master/battle/StatusPreset";
import { SkillId, SkillPreset } from "../../../../shared/master/battle/type/SkillPreset";
import { BattleAction, BattlerSide, combatCommandInput } from "../../../../shared/type/battle/BattleAction";
import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { SkillEffectKindId } from "../../../../shared/type/battle/skill/skillFormula";
import { BattleResult, TargetType } from "../../../../shared/type/battle/TargetType";
import { AIActionResolver } from "../enemy/ai/AIActionResolver";
import { BattleLogFormatter } from "../event/BattleLogFormatter";
import { ActionFactory } from "../logic/actions/ActionFactory";
import { SkillExecutor } from "../logic/skills/SkillExecutor";
import { TargetResolver } from "../logic/targets/TargetResolver";
import { TraitRunner } from "../logic/traits/TraitRunner";
import { BattlePort } from "../port/BattlePort";
import { Battler } from "./Battler";
import { BattleState, createInitialBattleState } from "./BattleState";
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

    private emitUI!: (event: AppUIEvent) => void;

    private actionFactory: ActionFactory;

    private onItemConsumed?: (itemId: string) => void;

    constructor(
        private battleLogFormatter: BattleLogFormatter,
        private skillRepository: SkillRepository,
    ) {
        this.actionFactory = new ActionFactory(skillRepository);
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

    /** 道具使用時に在庫を1つ減らすコールバックを登録(gameState 側で消費する) */
    setItemConsumer(consume: (itemId: string) => void) {
        this.onItemConsumed = consume;
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

        // ターン開始時の処理（毒ダメージなど）を実行し、結果を取得
        const turnStartResults = actor.onTurnStart();

        // 結果があればログに出力
        if (turnStartResults.length > 0) {
            this.logResults(turnStartResults);
            await delay(400);
        };

        // ターン開始Trait
        TraitRunner.onTurnStart(actor);

        // 行動前に味方のHP/MP/status 更新
        this.emitUI({
            type: "UPDATE_ALLIE_STATUS", allies: {
                allies: this.battleState.allies.map(ally => ({
                    instanceId: ally.instanceId,
                    name: ally.name,
                    hp: ally.baseStats.hp,
                    maxHp: ally.baseStats.maxHp,
                    mp: ally.baseStats.mp,
                    maxMp: ally.baseStats.maxMp,
                    states: ally.statusEffects.map(effect => ({
                        id: effect.statusId,
                        duration: effect.duration,
                        imageKey: StatusPresets[effect.statusId].iconKey
                    }))
                }))
            }
        })

        // 行動不能スキップ
        if (!canBattlerAct(actor)) {
            this.advanceTurn();
            return [];
        }

        let action: BattleAction;
        let usedItemId: string | undefined;

        switch (actor.side) {
            case BattlerSide.ALLY:

                this.battlePort.addBattleLog(`${actor.name}のターン！`);

                // usecase からUI入力を受け取る => action 生成
                const skillItems: SkillItem[] = actor.skillIds.map(id => {
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
                const input: combatCommandInput = await this.battlePort.requestCommand(this.battleState.allies, this.battleState.enemies, skillItems);

                usedItemId = input.itemId;

                action = this.actionFactory.createAction(input, this.battleState, actor);

                console.log("⚔Ally Action「", actor.name, "」=>", action)
                break;
            case BattlerSide.ENEMY:
                // 思考演出
                await delay(600);
                // 最適行動を目指す！ 
                const AIBestAction = AIActionResolver.decideAction(actor, this.battleState, this.convertSkillIdToSkillPreset(actor.skillIds));// actor.skillをskillPresetに変換
                console.log("AIBestAction:", AIBestAction);

                const AIBattleInput = this.actionFactory.convertStrangeToInput(AIBestAction, actor.instanceId);
                console.log("AIBattleInput:", AIBattleInput);

                action = this.actionFactory.createAction(AIBattleInput, this.battleState, actor);
                break;
        }

        // 実行
        const results = await this.executeAction(action);

        // 道具を使ったなら在庫から1つ消費する
        if (usedItemId) this.onItemConsumed?.(usedItemId);

        // special calls of combat-end
        this.processSpecialResults(results);



        this.checkBattleEnd();

        if (!this.battleState.finished) {
            this.advanceTurn();
        }

        // ログ生成
        this.logResults(results);

        actor.onTurnEnd();

        TraitRunner.onTurnEnd(actor);

        // 行動後に味方のHP/MP/status 更新
        this.emitUI({
            type: "UPDATE_ALLIE_STATUS", allies: {
                allies: this.battleState.allies.map(ally => ({
                    instanceId: ally.instanceId,
                    name: ally.name,
                    hp: ally.baseStats.hp,
                    maxHp: ally.baseStats.maxHp,
                    mp: ally.baseStats.mp,
                    maxMp: ally.baseStats.maxMp,
                    states: ally.statusEffects.map(effect => ({
                        id: effect.statusId,
                        duration: effect.duration,
                        imageKey: StatusPresets[effect.statusId].iconKey
                    }))
                }))
            }
        })

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
        for (const instance of actor.statusEffects) {
            // 1. マスタデータからロジック(Preset)を取得
            const preset = StatusPresets[instance.statusId];
            if (!preset) continue;

            const reWrite = preset.onRewriteAction?.(action, {
                ...rewriteCtx,
                // instance // インスタンス固有のデータ(value等)が必要な場合のため
            });
            if (!reWrite) continue;
            action = this.actionFactory.createAction(this.actionFactory.convertStrangeToInput(reWrite, actor.instanceId), this.battleState, actor) ?? action;
        }

        // Traitによる行動書き換え
        action = TraitRunner.beforeAction(actor, action);

        const skill = action.skill;
        if (!skill) throw new Error("BattleManager executeAction cant found action.skill");

        // MP不足チェック: 足りなければスキル/魔法は不発。ログを出して行動を空振りさせる。
        const mpCost = TraitRunner.applyMpCost(skill.cost?.mp ?? 0, skill, actor.traits);
        if (actor.baseStats.mp < mpCost) {
            this.battlePort.addBattleLog(`${actor.name}はMPが足りない！`);
            return [];
        }

        this.battlePort.addBattleLog(`${actor.name}は${skill.name}を使った！`);

        // 対象を解決
        const targets = TargetResolver.resolve(action.target ?? { type: TargetType.SELF }, this.battleState, actor.instanceId);

        const results = SkillExecutor.execute(actor, skill, targets);

        console.log("SkillExecutor results", results);

        return results;
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
        this.emitUI({
            type: "SHOW_ALLIES_STATUS", allies: {
                allies: this.battleState.allies.map(ally => ({
                    instanceId: ally.instanceId,
                    name: ally.name,
                    hp: ally.baseStats.hp,
                    maxHp: ally.baseStats.maxHp,
                    mp: ally.baseStats.mp,
                    maxMp: ally.baseStats.maxMp,
                    states: ally.statusEffects.map(effect => ({
                        id: effect.statusId,
                        duration: effect.duration,
                        imageKey: StatusPresets[effect.statusId].iconKey
                    }))
                }))
            }
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

    private convertSkillIdToSkillPreset(skillIds: SkillId[]): SkillPreset[] {
        return skillIds.map(id => this.skillRepository.get(id));
    }

    private logResults(results: SkillResult[]) {
        for (const result of results) {
            const battler = this.findBattler(result.instanceId);
            const target = this.findBattler(result.targetId);

            if (!battler || !target) continue;

            const logs = this.battleLogFormatter.fromResult(result, battler ?? target, target);
            logs.forEach(log => this.battlePort.addBattleLog(log));
        }
    }

    reset(): void {
        this.battleState = createInitialBattleState();
        this.buildTurnOrder();
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

    private processSpecialResults(results: SkillResult[]) {

        for (const r of results) {

            if (r.kind === SkillEffectKindId.ESCAPE && r.success) {
                this.finish(BattleResult.ESCAPE);
            }

        }
    }
}
