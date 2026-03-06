// shared/master/battle/EnemyPresets.ts

import { EnemyPreset } from "./type/EnemyPreset ";

export const EnemyPresets: Record<string, EnemyPreset> = {
    SLIME: {
        id: "SLIME",
        name: "スライム",
        level: 1,
        baseStats: {
            hp: 3,
            mp: 0,
            attack: 4,
            defense: 2,
            magic: 1,
            speed: 3
        },
        skills: ["attack"],
        expReward: 5,
        goldReward: 3,

        aiType: "AGGRESSIVE"
    }
};
