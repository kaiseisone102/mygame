// src/shared/type/mapRules.ts

import { MapId } from "./MapId";
import { TileType } from "./tileType";

// 7%(0.07)位から敵が出る体感,9%時点で70%エンカウント
export const mapRules = {
    // never random appear enemy ↓
    [MapId.FOREST_TEMPLE]: {
        encounterEnabled: true,
        baseEncounterRate: 0.00,
        stepIncrease: 0.005,  // 0.01 は結構早くエンカする
        maxChance: 0.3,
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
        baseEncounterRate: 0.01,
        stepIncrease: 0.01,
        maxChance: 0.15,
    },
    [MapId.GRAVE_CAVE]: {
        encounterEnabled: true,
        baseEncounterRate: 0.05,
        stepIncrease: 0.02,
        maxChance: 0.3,
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
