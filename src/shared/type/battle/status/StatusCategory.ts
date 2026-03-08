// src/shared/type/battle/status/StatusCategory.ts

/* =====================
  ステータス効果カテゴリ
===================== */
export const StatusCategory = {
    ACTION_LOCK: "ACTION_LOCK",

    POISON: "POISON",
    BURN: "BURN",

    ATK_DOWN: "ATK_DOWN",
    DEF_DOWN: "DEF_DOWN",
    INT_DOWN: "INT_DOWN",
    SPD_DOWN: "SPD_DOWN",

    SHIELD: "SHIELD",
    REGEN: "REGEN",
    SPECIAL: "SPECIAL",
} as const;

export type StatusCategory = typeof StatusCategory[keyof typeof StatusCategory]

