import { StatusEffect } from "../../../../../../shared/type/battle/status/StatusEffect";

// 混乱
export const Confusion: StatusEffect = {
    id: "CONFUSION",
    category: "CONFUSION",
    priority: 15,

    duration: -1,
    stackRule: "REPLACE",

    onBeforeAction: () => {
        // 行動不可 30%
        return Math.random() >= 0.3;
    },

    shouldExpire: () => {
        // 20%で治る
        return Math.random() < 0.2;
    },

    onExpire: (battler) => {
        console.log(`${battler.hp} の混乱が治った`);
    }
};

// 魅了（混乱の上位互換）
export const Charm: StatusEffect = {
    id: "CHARM",
    category: "CONFUSION",

    priority: 30,
    duration: -1,
    stackRule: "REPLACE",

    onBeforeAction: () => {
        // 行動不可 80%
        return Math.random() >= 0.8;
    },

    shouldExpire: () => {
        // 40%で治る
        return Math.random() < 0.4;
    },

    onExpire: (battler) => {
        console.log(`${battler.hp} の魅了解けた`);
    }
};

