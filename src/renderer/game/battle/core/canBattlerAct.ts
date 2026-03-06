// src/renderer/game/battle/core/canBattlerAct.ts

import { Battler } from "./Battler";

export function canBattlerAct(battler: Battler): boolean {
    // 死亡してたら当然動けない
    if (!battler.alive) return false;

    // 状態異常チェック（睡眠・麻痺など）
    return battler.canAct();
}
