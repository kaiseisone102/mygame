// src/shared/json/ally/AllyTemplateJson.ts

import { BaseStats } from "../../data/playerConstants";
import { BattlerSide } from "../../type/battle/BattleAction";

export const AllyKey = {
    HERO: "HERO", MAGE: "MAGE", FIGHTER: "FIGHTER", DOG: "DOG"
} as const;
export type AllyKey = typeof AllyKey[keyof typeof AllyKey];

export interface AllyTemplateJson {
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

export type AllyMasterJson = Record<
    AllyKey,
    AllyTemplateJson
>;
