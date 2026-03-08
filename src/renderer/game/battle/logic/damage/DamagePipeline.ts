// src/renderer/game/battle/logic/damage/DamagePipeline.ts

import { Battler } from "../../core/Battler";

export function computeDamage(
    attacker: Battler,
    defender: Battler,
    power: number
): number {

    const atk = attacker.getStat("attack");
    const def = defender.getStat("defense");

    const base = atk * power;

    const reduced = base - def;

    return Math.max(1, Math.floor(reduced));
}