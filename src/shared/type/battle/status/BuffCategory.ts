// src/shared/type/battle/status/BuffCategory.ts

/* =====================
  バフ・デバフカテゴリ
===================== */

export const BuffCategory = {
  DEF: "DEF",
  ATK: "ATK",
  INT: "INT",
  SPD: "SPD",
  AGGRO: "AGGRO"
} as const;

export type BuffCategory = typeof BuffCategory[keyof typeof BuffCategory];

// export type BuffCategory = "DEF" | "ATK" | "MAGIC" | "SPEED";
