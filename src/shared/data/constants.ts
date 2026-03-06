// src/shared/data/constants.ts

export const NORM_SIZE: number = 32;
export const P_HIT_SIZE: number = NORM_SIZE * 0.8;
export const TILE_SIZE = NORM_SIZE;
export const CHUNK_TILES = 16;
export const CHUNK_SIZE = TILE_SIZE * CHUNK_TILES;

export const NUMBER_OF_SLOT: number = 3;
// 会話判定ボックス(プレイヤー前方)
export const TALK_RECT_REACH = NORM_SIZE * 2;   // ボックス長さ
export const TALK_RECT_WIDTH = NORM_SIZE * 2;   // ボックス幅

// マップ毎の基本エンカウント率
export const BASE_ENCOUNTER_RATE_SAFE = 0;
export const BASE_ENCOUNTER_RATE_MID = 0.01;
export const BASE_ENCOUNTER_RATE_DANGEROUS = 0.5;

// どれくらい歩いたら抽選されるか
export const ENCOUTER_RATE = 10;


export const ENCOUNTER_STEP_INCREASE = 0.01;     // +10%
export const ENCOUNTER_STEP_INCREASE_RATE_FOREST_TEMPLE = 0;
export const ENCOUNTER_STEP_INCREASE_RATE_TOWN = 0;
export const ENCOUNTER_STEP_INCREASE_RATE_WORLD_MAP = 0.0001;
export const ENCOUNTER_STEP_INCREASE_RATE_CAVE = 0.001;

export const ENCOUNTER_MAX_CHANCE = 0.3;        // 最大30%
export const ENCOUNTER_MAX_CHANCE_FOREST_TEMPLE = 0;
export const ENCOUNTER_MAX_CHANCE_TOWN = 0;
export const ENCOUNTER_MAX_CHANCE_WORLD_MAP = 0.30;
export const ENCOUNTER_MAX_CHANCE_CAVE = 0.50;

// 戦闘画面
export const BATTLE_LOG_TYPE_SPEED = 20;
