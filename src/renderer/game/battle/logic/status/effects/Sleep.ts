// src/renderer/game/battle/logic/status/effects/Sleep.ts

import type { StatusEffect } from "../StatusEffect";

export const Sleep: StatusEffect = {
    id: "SLEEP",
    category: "SLEEP",
priority: 10,

    duration: -1, // 自然解除なし（確率のみ）
    stackRule: "REPLACE",

    onBeforeAction: () => false,

    shouldExpire: () => {
        // 40%で目覚める
        return Math.random() < 0.4;
    },

    onExpire: (battler) => {
        console.log(`${battler.name} は目を覚ました`);
    }
};

export const StrongSleep: StatusEffect = {
    id: "STRONG_SLEEP",
    category: "SLEEP",
    priority: 20,

    duration: -1,
    stackRule: "REPLACE",

    onBeforeAction: () => false,
    shouldExpire: () => Math.random() < 0.2,
};

