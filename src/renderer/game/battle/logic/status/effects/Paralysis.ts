import { StatusEffect } from "@/shared/type/battle/status/StatusEffect";

export const Paralysis: StatusEffect = {
    id: "PARALYSIS",
    category: "PARALYSIS",
    priority: 15,

    duration: -1,
    stackRule: "IGNORE",

    onBeforeAction: () => {
        // 行動不可 50%
        return Math.random() >= 0.5;
    },

    shouldExpire: () => {
        // 20%で治る
        return Math.random() < 0.2;
    },

    onExpire: (battler) => {
        console.log(`${battler.hp} のしびれが治った`);
    }
};
