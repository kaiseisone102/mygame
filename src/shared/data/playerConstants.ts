// src/shared/data/playerConstants.ts

import { MapId } from "../type/MapId";
import { PlayerPxPosition } from "../type/playerPosition/posType";
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
export const DEFAULT_PLAYER_MAX_HP: number = 100;
export const DEFAULT_PLAYER_MP: number = 30;
export const DEFAULT_PLAYER_MAX_MP: number = 30;
export const DEFAULT_PLAYER_ATTACK: number = 5;
export const DEFAULT_PLAYER_MAGIC: number = 5;
export const DEFAULT_PLAYER_DEFENCE: number = 5;
export const DEFAULT_PLAYER_SPEED: number = 5;
export const DEFAULT_PLAYER_LUCK: number = 5;
export const DEFAULT_PLAYER_AVOID: number = 0;
export const DEFAULT_PLAYER_CRTICAL: number = 0;
export const DEFAULT_PLAYER_BASE_STATS: BaseStats = {
    hp: DEFAULT_PLAYER_HP,
    maxHp: DEFAULT_PLAYER_MAX_HP,
    mp: DEFAULT_PLAYER_MP,
    maxMp: DEFAULT_PLAYER_MAX_MP,
    attack: DEFAULT_PLAYER_ATTACK,
    magic: DEFAULT_PLAYER_MAGIC,
    defense: DEFAULT_PLAYER_DEFENCE,
    speed: DEFAULT_PLAYER_SPEED,
    luck: DEFAULT_PLAYER_LUCK,
    avoid: DEFAULT_PLAYER_AVOID,
    crtical: DEFAULT_PLAYER_CRTICAL,
};

export const DEFAULT_EVENTFLAG: EventFlagsByWorld = { FOREST_TEMPLE: {}, WORLD_MAP: {}, NO_FEATURE_TOWN: {}, GRAVE_CAVE: {} };
export const DEFAULT_COLLECTED_ITEMS: Record<string, boolean> = {};

export interface BaseStats {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    attack: number;
    defense: number;
    magic: number;
    speed: number;
    luck: number;
    avoid: number;
    crtical: number;
}