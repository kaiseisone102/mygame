// src/shared/battle/calculator/executeAttack.ts

import { Battler } from "../../core/Battler";

export function executeAttack(
    attacker: Battler,
    targets: Battler[]
) {
    targets.forEach(target => {
        if (!target.alive) return;

        const baseDamage = Math.max(
            1,
            attacker.attack - target.defense
        );

        const damage = Math.floor(baseDamage * randomRange(0.9, 1.1));

        target.hp = Math.max(0, target.hp - damage);

    });
}

function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}
