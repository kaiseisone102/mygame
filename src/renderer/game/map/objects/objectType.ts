// src/renderer/game/map/tiles/tileType.ts
export enum ObjectType {
    TREE = 0,       // 木3*3（不可）
    THRONE = 1,     // 玉座3*2（不可）
}
// map制作ながれ　src/game/map直下ファイル
// ① TileType,titleData ← タイルの種類定義
// ② isWalkable         ← 通行可否ルール
// ③ createWorld系      ← マップ内容を書く場所
// ④ TileRenderer       ← 見た目