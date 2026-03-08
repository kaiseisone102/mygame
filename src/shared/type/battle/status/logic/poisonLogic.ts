// src/shared/master/battle/poisonLogic.ts

import { StatusLogic } from "../../../../master/battle/StatusPreset";

// ☠ poisonLogic
export function poisonLogic(rate: number): StatusLogic {
    return {
        // ターン開始時の処理
        onTurnTick: ctx => { ctx.baseStats.hp -= Math.floor(ctx.baseStats.maxHp * rate) },
    };
}
