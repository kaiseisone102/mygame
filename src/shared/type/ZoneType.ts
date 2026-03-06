// src/shared/type/ZoneType.ts

export const ZoneType = {
    ENTRY: "ENTRY",
    FIELD_ENEMY: "FIELD_ENEMY",
    RANDOM_ENEMY_ENCOUNT: "RANDOM_ENEMY_ENCOUNT",
    WALKABLE_ZONE: "WALKABLE_ZONE",
    EVENT: "EVENT",
    WARP: "WARP",
    TRAP: "TRAP",
    OBSTACLE:"OBSTACLE"
} as const;

export type ZoneType = typeof ZoneType[keyof typeof ZoneType]

export const MapDataCategory = {
    ZONES: "ZONES",
    NPCS: "NPCS",
    SIGNS: "SIGNS",
    ITEMS: "ITEMS",
    EMVIRONMENT: "EMVIRONMENT"
} as const;

export type MapDataCategory = typeof MapDataCategory[keyof typeof MapDataCategory];
