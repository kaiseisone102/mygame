// src/renderer/game/map/objects/objectDatabase.ts

import { ImageKey } from "../../../../shared/type/ImageKey";
import { ObjectType } from "./objectType";

// オブジェクトレイヤーのオブジェクト
export interface MapObject {
    type: ObjectType;

    walkable?: boolean;         // 衝突判定
    width?: number;             // 描画幅（タイル）
    height?: number;            // 描画高さ（タイル）

    hitWidth?: number;          // 当たり判定幅（タイル）
    hitHeight?: number;         // 当たり判定高さ（タイル）

    imageKey: string;           // 画像
    color?: string;             // テスト用色
}

export const objectDatabase: Record<
    ObjectType,
    Omit<MapObject, "type">
> = {
    [ObjectType.TREE]: {
        walkable: false,
        width: 3,
        height: 3,
        hitWidth: 2,
        hitHeight: 1,   // 幹だけ当たる
        imageKey: ImageKey.TREE,
        color: "#2e7d32",
    },
    [ObjectType.THRONE]: {
        walkable: false,
        width: 3,
        height: 2,
        hitWidth: 3,
        hitHeight: 1,
        imageKey: ImageKey.TREE,
        color: "#f4220aff",
    },
}

// map制作ながれ　src/game/map直下ファイル
// ① TileType,titleData ← タイルの種類定義
// ①-2 objectLayer   ← 大型タイルの位置
// ② isWalkable         ← 通行可否ルール
// ③ createWorld系      ← マップ内容を書く場所
// ④ TileRenderer       ← 見た目