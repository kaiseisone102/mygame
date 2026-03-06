// src/shared/data/playerConstants.ts

import { MapId } from "../type/MapId";
import { PlayerPxPosition, PlayerTilePosition } from "../type/playerPosition/posType";
import { NORM_SIZE } from "./constants";

export type EventFlagsByWorld = Record<MapId, Record<string, boolean>>;

// 初期データ
export const SAVE_VERSION = 2;
export const DEFAULT_PLAYER_NAME: string = "たごさく＆まきだい";
export const DEFAULT_START_MAP_ID: MapId = MapId.FOREST_TEMPLE
export const DEFAULT_START_POSITION_BY_WORLD: PlayerPxPosition = {
    FOREST_TEMPLE: { x: 10 * NORM_SIZE, y: 5 * NORM_SIZE },
    WORLD_MAP: { x: 20 * NORM_SIZE, y: 195 * NORM_SIZE },
    NO_FEATURE_TOWN: { x: 10 * NORM_SIZE, y: 5 * NORM_SIZE },
    GRAVE_CAVE: { x: 10 * NORM_SIZE, y: 5 * NORM_SIZE },
};
// 10 が無難
export const MOVE_SPEED: number = 15 * NORM_SIZE;

export const DEFAULT_PLAYER_LEVEL: number = 1;
export const DEFAULT_PLAYER_EXP: number = 0;
export const DEFAULT_PLAYER_GOLD: number = 0;

// 戦闘用ステータス
export const DEFAULT_PLAYER_HP: number = 100;
export const DEFAULT_PLAYER_MP: number = 30;
export const DEFAULT_PLAYER_POW: number = 5;
export const DEFAULT_PLAYER_INT: number = 5;
export const DEFAULT_PLAYER_DEF: number = 5;
export const DEFAULT_PLAYER_SPD: number = 5;
export const DEFAULT_PLAYER_LUC: number = 5;
export const DEFAULT_PLAYER_AVO: number = 0;
export const DEFAULT_PLAYER_CRT: number = 0;

export const DEFAULT_EVENTFLAG: EventFlagsByWorld = { FOREST_TEMPLE: {}, WORLD_MAP: {}, NO_FEATURE_TOWN: {}, GRAVE_CAVE: {} };
export const DEFAULT_COLLECTED_ITEMS: Record<string, boolean> = {};

