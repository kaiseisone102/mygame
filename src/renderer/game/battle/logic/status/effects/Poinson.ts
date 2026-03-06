// src/renderer/game/battle/logic/status/effects/Poison.ts

import { StatusEffect } from "../StatusEffect";

export const Poison: StatusEffect = {
    id: "POISON",
    duration: 3,
    stackRule: "EXTEND",

    onTurnStart: battler => {
        battler.hp -= Math.floor(battler.maxHp * 0.05);
    },
};
