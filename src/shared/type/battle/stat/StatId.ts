// src/shared/type/battle/stat/StatId.ts

export const StatId = {
    HP: "HP",
    ATK: "ATK",
    DEF: "DEF",
    INT: "INT",
    SPD: "SPD",
} as const;

export type StatId = typeof StatId[keyof typeof StatId];

export type StatBlock = Record<StatId, number>;