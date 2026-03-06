// src/shared/battle/turn/startTurn.ts

import { BattleState } from "../../core/BattleState";
import { buildTurnOrder } from "./buildTurnOrder";

export function startTurn(state: BattleState) {
    state.turn += 1;

    state.order = buildTurnOrder(state.allies, state.enemies);
    state.currentActorId = 0;
}

export function getCurrentActor(state: BattleState) {
    return state.order[state.currentActorId];
}
