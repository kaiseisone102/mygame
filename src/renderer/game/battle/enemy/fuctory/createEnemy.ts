// renderer/game/battle/factory/createEnemy.ts

import { EnemyPresets } from "../../../../../shared/master/battle/EnemyPresets";
import { BattlerSide } from "../../../../../shared/type/battle/BattleAction";
import { Battler } from "../../core/Battler";

let nextId = 1000;

export function createEnemy(presetId: string): Battler {
    const preset = EnemyPresets[presetId];

    return new Battler({
        id: nextId++,
        name: preset.name,
        side: BattlerSide.ENEMY,
        level: preset.level,
        baseStats: {
            hp: preset.baseStats.hp,
            maxHp: preset.baseStats.hp,
            mp: preset.baseStats.mp,
            maxMp: preset.baseStats.mp,
            attack: preset.baseStats.attack,
            defense: preset.baseStats.defense,
            magic: preset.baseStats.magic,
            speed: preset.baseStats.speed
        },
        growthTable: preset.growthTable ?? {},
        skills: preset.skills,
        traits: preset.traits ?? [],
        aiType: preset.aiType
    });
}
