// src/renderer/game/map/objects/isHitObject.ts

import { P_HIT_SIZE } from "../../../../shared/data/constants";
import { ObjectLayer } from "./objectLayer";
import { getObjectHitRect, isRectHit } from "./rect";
import { WorldPxPosition } from "../../../../shared/type/playerPosition/posType";

export function isHitObject(
    pos: WorldPxPosition,
    objectLayer: ObjectLayer
): boolean {
    const hitSizeTile = P_HIT_SIZE;
    const x = pos.x - hitSizeTile / 2;
    const y = pos.y - hitSizeTile / 2;
    // ★ pixel → tile
    const playerRect = {
        pos: { x: x, y: y },
        w: hitSizeTile,
        h: hitSizeTile,
    };

    for (const obj of objectLayer) {
        const objRect = getObjectHitRect(obj);
        if (!objRect) continue;

        if (isRectHit(playerRect, objRect)) {
            return true;
        }
    }
    return false;
}
