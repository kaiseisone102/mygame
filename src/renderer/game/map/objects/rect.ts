// src/renderer/game/map/objects/rect.ts

import { NORM_SIZE } from "../../../../shared/data/constants";
import { WorldPxPosition, WorldTilePosition } from "../../../../shared/type/playerPosition/posType";
import { PlacedObject } from "./objectLayer";

//オブジェクトレイヤーの当たり判定 オブジェクトはタイル座標のため?
export interface RectTile {
    pos: WorldTilePosition;
    w: number;
    h: number;
}
export interface RectPx {
    pos: WorldPxPosition;
    w: number;
    h: number;
}
export function isRectHit(a: RectPx, b: RectPx): boolean {
    return (
        a.pos.x < b.pos.x + b.w &&
        a.pos.x + a.w > b.pos.x &&
        a.pos.y < b.pos.y + b.h &&
        a.pos.y + a.h > b.pos.y
    );
}

// オブジェクトの HitBox を作る
export function getObjectHitRect(obj: PlacedObject): RectPx | null {
    if (obj.walkable) return null;

    const w = (obj.hitWidth ?? obj.width ?? 1) * NORM_SIZE;
    const h = (obj.hitHeight ?? obj.height ?? 1) * NORM_SIZE;
    const x = obj.tx * NORM_SIZE;
    const y = obj.ty * NORM_SIZE + ((obj.height ?? 1) - (obj.hitHeight ?? 1));

    return { pos: { x: x, y: y }, w, h };
}

// プレイヤーの当たり判定
export function getPlayerRect(pos: WorldPxPosition): RectPx {
    return {
        pos: { x: pos.x, y: pos.y },
        w: 0.8,
        h: 0.8,
    };
}
