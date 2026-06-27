// src/renderer/game/battle/logic/actions/ActionFactory.ts

import { SkillRepository } from "../../../../../shared/master/battle/SkillRepository";
import { ItemPresetsById } from "../../../../../shared/master/battle/ItemPreset";
import { convertItemToSkill } from "../../../../../shared/master/item/convertItemToSkill";
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
        // 道具使用時は道具→スキルに変換(skillRepository は通さない)。通常は習得スキルを引く。
        const skill = input.itemId
            ? this.resolveItemSkill(input.itemId)
            : this.skillRepository.get(input.skillId);
        if (!skill) throw new Error(`Skill/Item not found: ${input.itemId ?? input.skillId}`);

       return {
            actorMasterId: currentActor.actorMasterId,
            actorInstanceId: currentActor.instanceId,
            actorName: currentActor.name,
            skillId: skill.id,
            targetInstanceIds: [input.targetId],
            skill,
            target: this.buildTarget(input, skill, currentActor, state),
        };
    }

    /** itemId から実行用スキルを生成。未知のIDなら undefined */
    private resolveItemSkill(itemId: string): SkillPreset | undefined {
        const preset = ItemPresetsById[itemId];
        return preset ? convertItemToSkill(preset) : undefined;
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
            case TargetType.SINGLE_ENEMY: {
                // 明示ターゲットが無ければ(道具など targetId<=0)最初の生存敵を自動選択
                const enemyId = (input.targetId && input.targetId > 0)
                    ? input.targetId
                    : (state.enemies.find(e => e.alive)?.instanceId ?? input.targetId);
                return {
                    type: TargetType.SINGLE_ENEMY,
                    actorInstanceId: currentActor.instanceId,
                    enemyInstanceId: enemyId,
                };
            }

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

            case TargetType.SINGLE_ALLY: {
                // 明示ターゲットがあればそれ、無ければ(道具など targetId<=0)最も負傷した生存中の味方を自動選択
                let allyId = (input.targetId && input.targetId > 0) ? input.targetId : undefined;
                if (allyId === undefined) {
                    const wounded = state.allies
                        .filter(a => a.alive)
                        .sort((a, b) => (a.baseStats.hp / a.baseStats.maxHp) - (b.baseStats.hp / b.baseStats.maxHp))[0];
                    allyId = wounded?.instanceId ?? currentActor.instanceId;
                }
                return {
                    type: TargetType.SINGLE_ALLY,
                    actorInstanceId: allyId,
                };
            }

            case TargetType.ALL_ALLIES:
                return { type: TargetType.ALL_ALLIES, actorInstanceId: currentActor.instanceId };

            case TargetType.SELF:
            case TargetType.SELF_AND_SINGLE_ALLY:
                return {
                    type: TargetType.SELF,
                    actorInstanceId: currentActor.instanceId,
                };

            default:
                // 未知の targetType(データの表記揺れ等)。黙って SELF に落とすと
                // 全体攻撃が自分に当たる等の事故になるため、警告を出してから SELF へ退避する。
                console.warn(`[ActionFactory] 未知の targetType: "${skill.targetType}" を SELF にフォールバックしました`);
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