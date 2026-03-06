// src/renderer/game/battle/enemy/ai/AIActionResolver.ts

import { SkillPresetsById } from "../../../../../shared/master/battle/SkillPresets";
import { BattleAction } from "../../../../../shared/type/battle/BattleAction";
import { CommandActionType, TargetType } from "../../../../../shared/type/battle/TargetType";
import { Battler } from "../../core/Battler";
import { BattleState } from "../../core/BattleState";
import { AIActionEvaluator } from "./AIActionEvaluator";


/**
 * 敵AI：行動を1つ決定する
 */
export class AIActionResolver {

    static decideAction(actor: Battler, state: BattleState): BattleAction {

        // 生きている敵（＝プレイヤー側）
        const targets = state.allies.filter(a => a.alive);
        if (targets.length === 0) {
            throw new Error("No valid targets for AI");
        }

        let bestScore = -Infinity;
        let bestAction: BattleAction | null = null;

        for (const skillId of actor.skills) {
            const skill = SkillPresetsById[skillId];
            if (!skill) continue;

            for (const target of targets) {
                const targets = [target];

                const score = AIActionEvaluator.evaluateSkill(
                    actor,
                    skill,
                    targets,
                    state
                );

                if (score > bestScore) {
                    bestScore = score;
                    bestAction = {
                        type: CommandActionType.ATTACK,
                        actorId: actor.id,
                        skillId,
                        target: {
                            type: TargetType.SINGLE_ENEMY,
                            enemyId: target.id,
                        },
                    };
                }
            }
        }

        // 何も選べなかったら防御
        return bestAction ?? {
            type: CommandActionType.DEFENCE,
            actorId: actor.id,
            skillId: "guard",
            target: { type: TargetType.SELF }
        };
    }
}
