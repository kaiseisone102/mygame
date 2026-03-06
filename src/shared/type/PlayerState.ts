// src/shared/type/PlayerState.ts

export interface PlayerData {
    x: number; // タイル座標 中心
    y: number; // タイル座標 中心
}

export const AppDirection = {
    UP: "UP", DOWN: "DOWN", LEFT: "LEFT", RIGHT: "RIGHT"
} as const;
export type AppDirection = typeof AppDirection[keyof typeof AppDirection];

export const PlayerMotionType = {
    IDLE: "IDLE", WALK: "WALK", RUN: "RUN"
}
export type PlayerMotionType = typeof PlayerMotionType[keyof typeof PlayerMotionType];

export type PlayerState =
    | { type: typeof PlayerMotionType.IDLE, direction: AppDirection }
    | { type: typeof PlayerMotionType.WALK, direction: AppDirection };