// src/shared/json/enemy/EnemyTemplateJson.ts

import { BaseStats } from "../../data/playerConstants";
import { BattlerSide } from "../../type/battle/BattleAction";

export const EnemyKey = {
    SLIME: "SLIME", DRACKY: "DRACKY", GHOST: "GHOST", DRAGON: "DRAGON"
} as const;
export type EnemyKey = typeof EnemyKey[keyof typeof EnemyKey];

export interface EnemyTemplateJson {
    templateId: number;
    name: string;
    side: BattlerSide;

    level: number;
    exp: number;

    baseStats: {
        hp: number;
        mp: number;
        attack: number;
        defense: number;
        magic: number;
        speed: number;
    };

    growthTable?: Record<number, Partial<BaseStats>>;

    statModifier?: number;
    skills?: string[];
    traits?: string[];
    aiType?: string;
    imageKey?: string;
}

export type EnemyMasterJson = Record<
    EnemyKey,
    EnemyTemplateJson
>;
