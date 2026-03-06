// src/shared/type/battle/status/StatusCategory.ts

/* =====================
  ステータス効果カテゴリ
===================== */
export const StatusCategory = {
    SLEEP: "SLEEP",
    CONFUSION: "CONFUSION",
    PARALYSIS: "PARALYSIS",
    POISON: "POISON",
    OTHER: "OTHER",
} as const;

export type StatusCategory = typeof StatusCategory[keyof typeof StatusCategory]

