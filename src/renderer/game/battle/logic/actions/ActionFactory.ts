// src/renderer/game/battle/logic/actions/ActionFactory.ts

import { SkillRepository } from "../../../../../shared/master/battle/SkillRepository";
import { BattleAction, StrangeAction, TargetSpecifier, BattlerSide, BattleInput, combatCommandInput } from "../../../../../shared/type/battle/BattleAction";
import { CommandActionType, TargetType } from "../../../../../shared/type/battle/TargetType";
import { MagicId, SkillPreset, TechniqueId } from "../../../../../shared/master/battle/type/SkillPreset";
import { Battler } from "../../core/Battler";
import { BattleState } from "../../core/BattleState";

export class ActionFactory {
    constructor(private skillRepository: SkillRepository) { }

    /**
     * UI入力(BattleInput)を、ロジック用のアクション(BattleAction)に変換
     */
    public createAction(input: combatCommandInput, state: BattleState, currentActor: Battler): BattleAction {
        const skill = this.skillRepository.get(input.skillId);
        if (!skill) throw new Error(`Skill not found: ${input.skillId}`);

       return {
            actorMasterId: currentActor.actorMasterId,
            actorInstanceId: currentActor.instanceId,
            actorName: currentActor.name,
            skillId: input.skillId,
            targetInstanceIds: [input.targetId],
            skill,
            target: this.buildTarget(input, skill, currentActor, state),
        };
    }

    /**
     * 状態異常などの書き換え用データ(StrangeAction)をBattleInputに変換
     */
    public convertStrangeToInput(action: StrangeAction, currentActorInstanceId: number): BattleInput {
        return {
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
        input: combatCommandInput,
        skill: SkillPreset,
        currentActor: Battler,
        state: BattleState
    ): TargetSpecifier {
        const isActorEnemy = currentActor.side === BattlerSide.ENEMY;

        switch (skill.targetType) {
            case TargetType.SINGLE_ENEMY:
                return {
                    type: TargetType.SINGLE_ENEMY,
                    actorInstanceId: currentActor.instanceId,
                    enemyInstanceId: input.targetId,
                };

            case TargetType.GROUP_ENEMY: {
                // 敵が使った場合は ALL_ENEMIES の処理へ横流しする
                if (isActorEnemy) {
                    return { type: TargetType.ALL_ENEMIES, actorInstanceId: currentActor.instanceId };
                }

                // 選択されたメインのターゲットを取得
                const mainTarget = this.findInState(input.targetId, state);
                if (!mainTarget) return { type: TargetType.GROUP_ENEMY, actorInstanceId: currentActor.instanceId, ids: [] };

                // メインターゲットと同じ陣営（side）かつ、同じ種類（actorMasterId）の生存者を抽出
                const targets = (mainTarget.side === BattlerSide.ALLY ? state.allies : state.enemies)
                    .filter(b => b.actorMasterId === mainTarget.actorMasterId && b.alive)
                    .map(b => b.instanceId);

                return {
                    type: TargetType.GROUP_ENEMY,
                    actorInstanceId: currentActor.instanceId,
                    ids: targets
                };
            }

            case TargetType.ALL_ENEMIES:
                return { type: TargetType.ALL_ENEMIES, actorInstanceId: currentActor.instanceId };

            case TargetType.SINGLE_ALLY:
                return {
                    type: TargetType.SINGLE_ALLY,
                    actorInstanceId: input.targetId ?? currentActor.instanceId,
                };

            case TargetType.ALL_ALLIES:
                return { type: TargetType.ALL_ALLIES, actorInstanceId: currentActor.instanceId };

            case TargetType.SELF:
            case TargetType.SELF_AND_SINGLE_ALLY:
            default:
                return {
                    type: TargetType.SELF,
                    actorInstanceId: currentActor.instanceId,
                };
        }
    }

    private findInState(instanceId: number, state: BattleState): Battler | undefined {
        return [...state.allies, ...state.enemies].find(b => b.instanceId === instanceId);
    }
}