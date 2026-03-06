// src/shared/battle/calculator/executeMagic.ts

import { Battler } from "../../core/Battler";
import { Skill } from "../../../../../shared/type/battle/skill/Skill";

export function executeMagic(
    caster: Battler,
    skill: Skill,
    targets: Battler[]
) {
    // MP不足
    if (caster.mp < skill.mpCost) {
        throw new Error("MPが足りない!!");
    }

    caster.mp -= skill.mpCost;

    switch (skill.id) {
        case "mera":
            applyDamage(caster, targets, 10);
            break;

        case "gira":
            applyDamage(caster, targets, 8);
            break;

        case "hoimi":
            applyHeal(caster, targets, 12);
            break;

        default:
            console.warn("未定義スキル:", skill.id);
    }
}

function applyDamage(
    caster: Battler,
    targets: Battler[],
    power: number
) {
    targets.forEach(target => {
        if (!target.alive) return;

        const damage = Math.max(
            1,
            Math.floor(power + caster.magic * 0.5)
        );

        target.hp = Math.max(0, target.hp - damage);

    });
}

function applyHeal(
    caster: Battler,
    targets: Battler[],
    power: number
) {
    targets.forEach(target => {
        if (!target.alive) return;

        const heal = Math.floor(power + caster.magic * 0.7);

        target.hp = Math.min(
            target.maxHp,
            target.hp + heal
        );
    });
}
