// src/renderer/game/map/isWalkable.ts

import { TileType } from "@/shared/type/tileType";
import { TileData } from "../tiles/createTileDatabase";

export function createIsWalkable(db: Record<TileType, TileData>) {
    return function isWalkable(tile: TileType, context?: any): boolean {
        const data: TileData = db[tile];

        // 拡張例：特定条件で通行可能にする
        if (tile === TileType.WATER && context?.canSwim) return true;

        return data.walkable;
    };
}
// map制作ながれ　src/game/map直下ファイル
// ① TileType.titleData ← タイルの種類定義
// ② isWalkable         ← 通行可否ルール
// ③ createWorld系      ← マップ内容を書く場所
// ④ TileRenderer       ← 見た目