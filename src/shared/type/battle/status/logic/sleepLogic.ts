// src/shared/battle/status/logic/sleepLogic.ts

import { StatusEffect } from "../StatusEffect";

// 😴 sleepLogic
export function sleepLogic(recoverRate: number): Pick<StatusEffect, "onBeforeAction" | "shouldExpire"> {
    return {
        // 行動不能か？
        onBeforeAction: () => false,
        // 確率解除の判定
        shouldExpire: () => Math.random() < recoverRate,
    };
}
