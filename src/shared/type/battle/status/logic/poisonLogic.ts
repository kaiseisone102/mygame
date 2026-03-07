// src/shared/master/battle/poisonLogic.ts

import { StatusEffect } from "../StatusEffect";

// ☠ poisonLogic
export function poisonLogic(rate: number): Pick<StatusEffect, "onTurnStart"> {
    return {
        // ターン開始時の処理
        onTurnStart: ctx => { ctx.baseStats.hp -= Math.floor(ctx.baseStats.maxHp * rate) },
    };
}
