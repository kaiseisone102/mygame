// src/shared/battle/status/logic/confusionLogic.ts

import { CommandActionType, TargetType } from "../../TargetType";
import { StatusEffect } from "../StatusEffect";

// 🤪 confusionLogic
export function confusionLogic(params: { failRate: number; recoverRate: number; }): Pick<StatusEffect, "onRewriteAction" | "shouldExpire"> {
    return {
        onRewriteAction: (action, ctx) => {
            if (Math.random() >= params.failRate) {
                return action;
            }

            const candidates = ctx.allies;
            const target = candidates[Math.floor(Math.random() * candidates.length)];

            return {
                type: CommandActionType.ATTACK,
                actorId: ctx.self.id,
                skillId: "attack",
                target: {
                    type: TargetType.SINGLE_ALLY,
                    actorId: target.id,
                },
            };
        },

        shouldExpire: () => Math.random() < params.recoverRate,
    };
}