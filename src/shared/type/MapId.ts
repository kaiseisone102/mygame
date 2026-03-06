// src/shared/type/MapId.ts

export const MapId = {
    FOREST_TEMPLE: "FOREST_TEMPLE",
    NO_FEATURE_TOWN: "NO_FEATURE_TOWN",
    WORLD_MAP: "WORLD_MAP",
    GRAVE_CAVE: "GRAVE_CAVE"
} as const;
export type MapId = typeof MapId[keyof typeof MapId]
