// src/shared/type/ImageKey.ts

/**
 * loadAssets() と 必ず一致させる
 */
export const ImageKey = {
    // タイル
    DIRT: "DIRT",
    WOODS: "WOODS",
    PLAIN: "PLAIN",
    SKY: "SKY",
    WALL: "WALL",
    WATER: "WATER",
    DARK: "DARK",
    // 洞窟タイル
    CAVEWALL: "CAVEWALL",
    CAVEFLOOR: "CAVEFLOOR",
    // オブジェクト
    TREE: "TREE",
    THRONE: "THRONE",
    // キャラクター
    PLAYER_STAND_LEFT: "PLAYER_STAND_LEFT",
    PLAYER_STAND_RIGHT: "PLAYER_STAND_RIGHT",
    PLAYER_LEFT_0: "PLAYER_LEFT_0",
    PLAYER_LEFT_1: "PLAYER_LEFT_1",
    PLAYER_LEFT_2: "PLAYER_LEFT_2",
    PLAYER_RIGHT_0: "PLAYER_RIGHT_0",
    PLAYER_RIGHT_1: "PLAYER_RIGHT_1",
    PLAYER_RIGHT_2: "PLAYER_RIGHT_2",
    // ゾーン
    TOWN_ICON: "TOWN_ICON",
    ENEMY_ICON: "ENEMY_ICON",
    AREA_ICON: "AREA_ICON",
    WOODEN_SIGN: "WOODEN_SIGN",
    GOLD_ICON: "GOLD_ICON",
    POTION_ICON: "POTION_ICON"

} as const;
export type ImageKey = typeof ImageKey[keyof typeof ImageKey];
