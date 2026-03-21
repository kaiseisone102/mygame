// src/renderer/game/battle/logic/actions/ActionFactory.ts

import { SkillRepository } from "../../../../../shared/master/battle/SkillRepository";
import { BattleAction, StrangeAction, TargetSpecifier, BattlerSide, BattleInput } from "../../../../../shared/type/battle/BattleAction";
import { TargetType } from "../../../../../shared/type/battle/TargetType";
import { SkillPreset } from "../../../../../shared/master/battle/type/SkillPreset";
import { Battler } from "../../core/Battler";
import { BattleState } from "../../core/BattleState";

export class ActionFactory {
    constructor(private skillRepository: SkillRepository) { }

    /**
     * UI入力(BattleInput)を、ロジック用のアクション(BattleAction)に変換
     */
    public createAction(input: BattleInput, state: BattleState): BattleAction {
        const skill = this.skillRepository.get(input.skillId);
        if (!skill) throw new Error(`Skill not found: ${input.skillId}`);

        const actor = this.findInState(input.actorInstanceId, state);

        return {
            commandId: input.commandId,
            actorMasterId: input.actorMasterId,
            actorInstanceId: input.actorInstanceId,
            actorName: input.actorName,
            skillId: input.skillId,
            targetInstanceIds: [input.targetId],
            skill,
            target: this.buildTarget(input, skill, actor, state),
        };
    }

    /**
     * 状態異常などの書き換え用データ(StrangeAction)をBattleInputに変換
     */
    public convertStrangeToInput(action: StrangeAction, currentActorInstanceId: number): BattleInput {
        return {
            commandId: action.commandId,
            actorMasterId: action.actorMasterId,
            actorInstanceId: action.actorInstanceId,
            actorName: action.actorName,
            skillId: action.skillId,
            enemy: [],
            targetId: action.targetInstanceIds[0] ?? currentActorInstanceId
        };
    }

    /**
     * ターゲット情報の組み立て (buildTarget)
     */
    private buildTarget(
        input: BattleInput,
        skill: SkillPreset,
        actor: Battler | undefined,
        state: BattleState
    ): TargetSpecifier {
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
                const mainTarget = this.findInState(input.targetId, state);
                if (!mainTarget) return { type: TargetType.GROUP_ENEMY, actorInstanceId: input.actorInstanceId, ids: [] };

                // メインターゲットと同じ陣営（side）かつ、同じ種類（actorMasterId）の生存者を抽出
                const targets = (mainTarget.side === BattlerSide.ALLY ? state.allies : state.enemies)
                    .filter(b => b.actorMasterId === mainTarget.actorMasterId && b.alive)
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

    private findInState(instanceId: number, state: BattleState): Battler | undefined {
        return [...state.allies, ...state.enemies].find(b => b.instanceId === instanceId);
    }
}