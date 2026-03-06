// src/shared/battle/rules/checkBattleEnd.ts

import { BattlePhase, BattleResult } from "@/shared/type/battle/TargetType";
import { BattleState } from "../../core/BattleState";

/** 
 * @param state BattleState
 * @returns true = 戦闘終わった
 */
export function checkBattleEnd(state: BattleState): boolean {
    const enemiesAlive = state.enemies.some(e => e.hp > 0);
    const alliesAlive = state.allies.some(a => a.hp > 0);

    if (!enemiesAlive) {
        state.finished = true;
        state.phase = BattlePhase.PHASE_FINISHED;
        state.result = BattleResult.WIN;
        return true;
    }

    if (!alliesAlive) {
        state.finished = true;
        state.phase = BattlePhase.PHASE_FINISHED;
        state.result = BattleResult.LOSE;
        return true;
    }

    return false;
}
