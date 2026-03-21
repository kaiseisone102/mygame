// src/shared/master/battle/poisonLogic.ts

import { StatusLogic } from "../../../../master/battle/StatusPreset";
import { StatusContext } from "../context/statusContext";

// ☠ poisonLogic
export function poisonLogic(rate: number): StatusLogic {
    return {
        // ターン開始時の処理
        onTurnTick: (ctx: StatusContext) => { ctx.target.baseStats.hp -= Math.floor(ctx.target.baseStats.maxHp * rate) },
    };
}
