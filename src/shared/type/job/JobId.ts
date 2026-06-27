// src/shared/type/job/JobId.ts

/**
 * 職業ID。
 * 装備の職制限(EquipmentPreset.equipableJobs)で使用する。
 * - BRAVER : 勇者(プレイヤーの分身。パーティ先頭)
 * - MAGE   : 魔法使い
 * - PRIEST : 僧侶
 * - WARRIOR: 戦士
 */
export const JobId = {
    BRAVER: "BRAVER",
    MAGE: "MAGE",
    PRIEST: "PRIEST",
    WARRIOR: "WARRIOR",
} as const;
export type JobId = typeof JobId[keyof typeof JobId];

/** 職の表示名(日本語) */
export const JOB_LABEL: Record<JobId, string> = {
    BRAVER: "勇者",
    MAGE: "魔法使い",
    PRIEST: "僧侶",
    WARRIOR: "戦士",
};
