// src/renderer/game/battle/enemy/ai/AIActionResolver.ts

import { SkillId, SkillPreset } from "../../../../../shared/master/battle/type/SkillPreset";
import { StrangeAction } from "../../../../../shared/type/battle/BattleAction";
import { CommandActionType } from "../../../../../shared/type/battle/TargetType";
import { Battler } from "../../core/Battler";
import { BattleState } from "../../core/BattleState";
import { AIActionEvaluator } from "./AIActionEvaluator";


/**
 * 敵AI：行動を1つ決定する
 */
export class AIActionResolver {

    static decideAction(actor: Battler, state: BattleState, skillData: SkillPreset[]): StrangeAction {

        // 生きている敵（＝プレイヤー側）
        const targets = state.allies.filter(a => a.alive);
        if (targets.length === 0) {
            throw new Error("No valid targets for AI");
        }

        let bestScore = -Infinity;
        let bestAction: StrangeAction | null = null;

        for (const skill of skillData) {
            for (const target of targets) {

                const score = AIActionEvaluator.evaluateSkill(
                    actor,
                    skill,
                    [target],
                    state
                );

                if (score > bestScore) {
                    bestScore = score;

                    bestAction = {
                        commandId: CommandActionType.ATTACK,
                        actorId: actor.id,
                        actorName: actor.name,
                        skillId: skill.id,
                        target: target.id
                    }
                };
            }
        }
        // 何も選べなかったら防御
        return bestAction ?? {
            commandId: CommandActionType.DEFENCE,
            actorId: actor.id,
            actorName: actor.name,
            skillId: SkillId.GUARD,
            target: actor.id
        };

    }
}
