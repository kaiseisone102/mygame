// src/renderer/game/battle/enemy/ai/AIActionResolver.ts

import { SkillPreset, TechniqueId } from "../../../../../shared/master/battle/type/SkillPreset";
import { StrangeAction } from "../../../../../shared/type/battle/BattleAction";
import { CommandActionType } from "../../../../../shared/type/battle/TargetType";
import { Battler } from "../../core/Battler";
import { BattleState } from "../../core/BattleState";
import { AIActionEvaluator } from "./AIActionEvaluator";


/**
 * 敵AI：行動を1つ決定する
 */
export class AIActionResolver {

    static decideAction(actor: Battler, state: BattleState, skills: SkillPreset[]): StrangeAction {

        // 生きている敵（＝プレイヤー側）
        const targets = state.allies.filter(a => a.alive);

        if (targets.length === 0) {
            throw new Error("No valid targets for AI");
        }

        // スキルがないなら攻撃
        if (skills.length === 0) {
            const target = targets[0];

            return {
                actorMasterId: actor.actorMasterId,
                actorInstanceId: actor.instanceId,
                actorName: actor.name,
                skillId: TechniqueId.ATTACK,
                targetInstanceIds: [target.instanceId]
            };
        }

        let bestScore = -Infinity;
        let bestAction: StrangeAction | null = null;

        for (const skill of skills) {

            const mpCost = skill.cost?.mp ?? 0;
            if (actor.baseStats.mp < mpCost) continue;

            for (const target of targets) {

                const realTargets =
                    skill.effectScope === "GROUP" || skill.effectScope === "ALL"
                        ? targets
                        : [target];

                const score = AIActionEvaluator.evaluateSkill(
                    actor,
                    skill,
                    realTargets,
                    state
                );

                if (score > bestScore) {
                    bestScore = score;

                    bestAction = {
                        actorMasterId: actor.actorMasterId,
                        actorInstanceId: actor.instanceId,
                        actorName: actor.name,
                        skillId: skill.id,
                        targetInstanceIds: [target.instanceId]
                    }
                };
            }
        }
        // 何も選べなかったら防御
        return bestAction ?? {
            actorMasterId: actor.actorMasterId,
            actorInstanceId: actor.instanceId,
            actorName: actor.name,
            skillId: TechniqueId.GUARD,
            targetInstanceIds: [actor.instanceId]
        };

    }
}
