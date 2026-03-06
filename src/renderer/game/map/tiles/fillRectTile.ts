// src/renderer/game/map/tiles/fillRectTile.ts

import { NORM_SIZE } from "../../../../shared/data/constants";
import { World } from "../../../../shared/core/world";
import { TileType } from "../../../../shared/type/tileType";

/**
 * @param world World 配置先 
 * @param x1    開始位置X（タイル位置）
 * @param x2    終了位置X（タイル位置）
 * @param y1    開始位置Y（タイル位置）
 * @param y2    終了位置Y（タイル位置）
 * @param type  ↓TileType一覧↓
 * @see  TileType にCtr + カーソルホバー
 */
export function fillRectTile(
    world: World,
    tx1: number,
    tx2: number,
    ty1: number,
    ty2: number,
    type: TileType
) {
    for (let ty = ty1; ty <= ty2; ty++) {
        for (let tx = tx1; tx <= tx2; tx++) {
            world.setTile({ tx, ty }, type);
        }
    }
}
