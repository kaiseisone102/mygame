// src/shared/battle/status/logic/confusionLogic.ts

import { SkillId } from "../../../../master/battle/type/SkillPreset";
import { BattleAction } from "../../BattleAction";
import { CommandActionType, TargetType } from "../../TargetType";
import { ActionRewriteContext } from "../context/ActionRewriteContext";
import { StatusEffect } from "../StatusEffect";

// 🤪 confusionLogic
export function confusionLogic(params: { failRate: number; recoverRate: number; }): Pick<StatusEffect, "onRewriteAction" | "shouldExpire"> {
    return {
        onRewriteAction: (action: BattleAction, ctx: ActionRewriteContext) => {
            if (Math.random() >= params.failRate) {
                return undefined;
            }

            const candidates = ctx.allies;
            const target = candidates[Math.floor(Math.random() * candidates.length)];

            return {
                commandId: CommandActionType.ATTACK,
                actorId: ctx.self.id,
                actorName: ctx.self.name,
                skillId: SkillId.ATTACK
            };
        },

        shouldExpire: () => Math.random() < params.recoverRate,
    };
}