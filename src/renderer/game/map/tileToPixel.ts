// src/renderer/game/map/tiltToPixel.ts

import { WorldPxPosition, WorldTilePosition } from "../../../shared/type/playerPosition/posType";
import { NORM_SIZE } from "../../../shared/data/constants";

export function tilePosToPxPos(pos: WorldTilePosition): WorldPxPosition {
    const pxPosX = pos.tx * NORM_SIZE;
    const pxPosY = pos.ty * NORM_SIZE;

    return { x: pxPosX, y: pxPosY };
}

// タイル座標なので小数点以下を切り捨てる
export function pxPosToTilePos(pos: WorldPxPosition): WorldTilePosition {
    const tilePosX = Math.floor(pos.x / NORM_SIZE);
    const tilePosY = Math.floor(pos.y / NORM_SIZE);

    return { tx: tilePosX, ty: tilePosY };
}