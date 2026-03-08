// 状態異常強度 上書きの優先度
export const STATUS_PRIORITY = {
    MINOR: 1,     // 軽い状態
    NORMAL: 10,   // 通常
    STRONG: 20,   // 強い
    BOSS: 50      // ボス級
} as const;

export const StatusTickType = {
    TURN_START: "TURN_START",
    TURN_END: "TURN_END"
} as const;

export type StatusTickType = typeof StatusTickType[keyof typeof StatusTickType];

export const MINIMUM_PRIORITY = 1;
export const SMALL_PRIORITY = 5;
export const MID_PRIORITY = 10;
export const LARGE_PRIORITY = 15;
export const VERY_LARGE_PRIORITY = 20;

export const ORDER_ACTION_LOCK = 30;
export const ORDER_CONTROL = 20;
export const ORDER_DAMAGE = 5;