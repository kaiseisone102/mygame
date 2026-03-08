// src/shared/type/battle/status/BuffCategory.ts

/* =====================
  バフ・デバフカテゴリ
===================== */

export const BuffCategory = {
    ATTACK: "attack",
    DEFENSE: "defense",
    MAGIC: "magic",
    SPEED: "speed",
    AGGRO: "aggro"
} as const;

export type BuffCategory = typeof BuffCategory[keyof typeof BuffCategory];

// export type BuffCategory = "DEF" | "ATK" | "MAGIC" | "SPEED";
