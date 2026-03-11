// src/shared/json/growTable/GrowTableJson.ts

export interface GrowStats {
    maxHp: number;
    maxMp: number;
    attack: number;
    defense: number;
    magic: number;
    speed: number;
    expRequired: number;
}

/**
 * レベルごとの成長テーブル
 * キーはレベル（1〜100など）
 */
export interface GrowTableJson {
    [level: number]: GrowStats;
}