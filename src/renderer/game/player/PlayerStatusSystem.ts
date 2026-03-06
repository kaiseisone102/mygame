// src/renderer/game/player/PlayerStatusSystem.ts

import { PlayerMoveResult } from "../../../renderer/input/moveSystem/handlePlayerMove";

type TileDamageEvents = {
    onEnter?: () => void;
    onLeave?: () => void;
    onTick?: (damage: number) => void;
};

let wasOnDamageTile = false;
let damageTimer = 0;

export function applyTileDamage(
    delta: number,
    moveResult: PlayerMoveResult,
    events: TileDamageEvents
) {
    // ---- 入った瞬間 ----
    if (moveResult.onDamageTile && !wasOnDamageTile) {
        events.onEnter?.();
        damageTimer = 0;
    }

    // ---- 出た瞬間 ----
    if (!moveResult.onDamageTile && wasOnDamageTile) {
        events.onLeave?.();
        damageTimer = 0;
    }

    // ---- 滞在中 ----
    if (moveResult.onDamageTile && moveResult.damage) {
        damageTimer += delta;
        if (damageTimer >= 0.5) {
            events.onTick?.(moveResult.damage);
            damageTimer = 0;
        }
    }

    wasOnDamageTile = moveResult.onDamageTile;
}