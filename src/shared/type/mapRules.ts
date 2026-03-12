// src/shared/type/mapRules.ts

import { BASE_ENCOUNTER_RATE_SAFE, ENCOUNTER_STEP_INCREASE_RATE_SAFE, ENCOUNTER_MAX_CHANCE_SAFE } from "../data/constants";
import { MapId } from "./MapId";
import { TileType } from "./tileType";

// 7%(0.07)位から敵が出る体感,9%時点で70%エンカウント
export const mapRules = {
    // never random appear enemy ↓
    [MapId.FOREST_TEMPLE]: {
        encounterEnabled: true,
        baseEncounterRate: BASE_ENCOUNTER_RATE_SAFE,
        stepIncrease: ENCOUNTER_STEP_INCREASE_RATE_SAFE,
        maxChance: ENCOUNTER_MAX_CHANCE_SAFE,
    },
    [MapId.NO_FEATURE_TOWN]: {
        encounterEnabled: false,
        baseEncounterRate: 0,
        stepIncrease: 0,
        maxChance: 0,
    },
    // random appearable enemy ↓
    [MapId.WORLD_MAP]: {
        encounterEnabled: true,
        baseEncounterRate: BASE_ENCOUNTER_RATE_SAFE,
        stepIncrease: ENCOUNTER_STEP_INCREASE_RATE_SAFE,
        maxChance: ENCOUNTER_MAX_CHANCE_SAFE,
    },
    [MapId.GRAVE_CAVE]: {
        encounterEnabled: true,
        baseEncounterRate: BASE_ENCOUNTER_RATE_SAFE,
        stepIncrease: ENCOUNTER_STEP_INCREASE_RATE_SAFE,
        maxChance: ENCOUNTER_MAX_CHANCE_SAFE,
    },

} satisfies Record<MapId, MapRule>;

export enum MapCategory {
    TOWN,
    FIELD,
    DUNGEON,
}

export type MapRule = {
    encounterEnabled: boolean;

    baseEncounterRate: number;

    // 「1歩ごとに増える量」
    stepIncrease: number;

    // 「最大到達確率」
    maxChance: number;
};

export const WORLD_DEFAULT_TILE: Record<MapCategory, TileType> = {
    [MapCategory.TOWN]: TileType.SKY,
    [MapCategory.FIELD]: TileType.WATER,
    [MapCategory.DUNGEON]: TileType.DARK,
};
