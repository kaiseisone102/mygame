// src/renderer/game/map/tiles/tileRenderer.ts

import { Camera } from "../../../../shared/core/camera";
import { World } from "../../../../shared/core/world";
import { NORM_SIZE } from "../../../../shared/data/constants";
import { TileType } from "../../../../shared/type/tileType";
import { TileData } from "./createTileDatabase";

export class TileRenderer {
    constructor(
        private tileDB: Record<TileType, TileData>
    ) { }

    render(world: World, camera: Camera, ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, camera.width, camera.height);
        // 描画範囲 (updatecamera)
        const ST_PADDING_PX = NORM_SIZE * 0;
        const EN_PADDING_PX = NORM_SIZE * 0;
        const startX = Math.floor((camera.x - ST_PADDING_PX) / NORM_SIZE);
        const startY = Math.floor((camera.y - ST_PADDING_PX) / NORM_SIZE);
        const endX = Math.ceil((camera.x + camera.width + EN_PADDING_PX) / NORM_SIZE);
        const endY = Math.ceil((camera.y + camera.height + EN_PADDING_PX) / NORM_SIZE);
        for (let ty = startY; ty < endY; ty++) {
            for (let tx = startX; tx < endX; tx++) {
                const tile: TileType = world.getTile({ tx, ty });
                const tileData = this.tileDB[tile];

                const screenX = tx * NORM_SIZE - camera.x;
                const screenY = ty * NORM_SIZE - camera.y;

                if (tileData?.image && tileData.image.complete) {
                    ctx.drawImage(tileData.image, screenX, screenY, NORM_SIZE, NORM_SIZE);
                } else {
                    // フォールバック（ロード前・デバッグ）
                    ctx.fillStyle = tileData?.color ?? "#000";
                    ctx.fillRect(screenX, screenY, NORM_SIZE, NORM_SIZE);
                }
            }
        }
        // viewport枠
        ctx.strokeStyle = "red";
        ctx.strokeRect(0, 0, camera.width, camera.height);
    }
}
