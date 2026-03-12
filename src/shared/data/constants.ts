// src/shared/data/constants.ts

import { CommandActionType } from "../type/battle/TargetType";

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
export const BASE_ENCOUNTER_RATE_SMALL = 0.001;
export const BASE_ENCOUNTER_RATE_MID = 0.01;
export const BASE_ENCOUNTER_RATE_DANGER = 0.05;

// prevent encounter for first few step
export const IGNORE_STEPS = 10;

export const ENCOUNTER_STEP_INCREASE_RATE_SAFE = 0.0002;
export const ENCOUNTER_STEP_INCREASE_RATE_SAMLL = 0.001;
export const ENCOUNTER_STEP_INCREASE_RATE_MID = 0.003;
export const ENCOUNTER_STEP_INCREASE_RATE_DANGER = 0.005;

// lucky kid no encount 
export const ENCOUNTER_MAX_CHANCE_SAFE = 0.02;
export const ENCOUNTER_MAX_CHANCE_SMALL = 0.05;
export const ENCOUNTER_MAX_CHANCE_MID = 0.2;
export const ENCOUNTER_MAX_CHANCE_DANGER = 0.5;

// 戦闘画面
export const BATTLE_LOG_TYPE_SPEED = 20;
export const BASIC_COMMANDS_DISPLAY: { id: CommandActionType; label: string }[] = [
    { id: CommandActionType.ATTACK, label: "Attack" },
    { id: CommandActionType.TECHNIQUE, label: "Technique" },
    { id: CommandActionType.MAGIC, label: "Magic Spell" },
    { id: CommandActionType.DEFENCE, label: "Defence" },
    { id: CommandActionType.ITEM, label: "Items" },
    { id: CommandActionType.ESCAPE, label: "Run" },
];
