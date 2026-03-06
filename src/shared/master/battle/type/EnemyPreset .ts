// shared/master/battle/type/EnemyPreset.ts

import { LevelGrowthTable } from "../../../type/battle/BattleAction";
import { Trait } from "../../../type/battle/trait/Trait";

export interface EnemyPreset {
    id: string;
    name: string;

    level?: number;

    baseStats: {
        hp: number;
        mp: number;
        attack: number;
        defense: number;
        magic: number;
        speed: number;
    };

    growthTable?: LevelGrowthTable;

    skills: string[];
    traits?: Trait[];

    expReward: number;
    goldReward: number;

    aiType: typeof AiType.AGGRESSIVE | typeof AiType.HEALER | typeof AiType.RANDOM
}

export const AiType = {
    AGGRESSIVE: "AGGRESSIVE", HEALER: "HEALER", RANDOM: "RANDOM"
} as const;
export type AiType = typeof AiType[keyof typeof AiType]