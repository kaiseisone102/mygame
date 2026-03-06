// src/renderer/modules/debugDrawPlayerHitbox.ts
import { NORM_SIZE, P_HIT_SIZE, TALK_RECT_REACH, TALK_RECT_WIDTH } from "../../../shared/data/constants";
import type { Camera } from "../../../shared/core/camera";
import type { ObjectLayer } from "../../../renderer/game/map/objects/objectLayer";
import { getPlayerRect, getObjectHitRect, RectTile, RectPx } from "../../../renderer/game/map/objects/rect";
import { AppDirection, PlayerState } from "../../../shared/type/PlayerState";
import { SignData } from "../../game/map/talkNPC/SignData";
import { ItemData } from "../../../renderer/game/map/talkNPC/ItemData";
import { NpcData } from "../../../renderer/game/map/talkNPC/NPCData";
import { ZoneType } from "../../../shared/type/ZoneType";
import { WorldPxPosition } from "../../../shared/type/playerPosition/posType";
import { ZonePx } from "../../../shared/type/ZonePx";

// プレイヤーヒットボックス
export function debugDrawPlayerHitbox(ctx: CanvasRenderingContext2D, pos: WorldPxPosition, camera: Camera) {
    const left = pos.x - P_HIT_SIZE / 2;
    const top = pos.y - P_HIT_SIZE / 2;
    ctx.save();
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;
    ctx.strokeRect(left - camera.x, top - camera.y, P_HIT_SIZE, P_HIT_SIZE);
    ctx.restore();
}

// オブジェクトのヒットボックス
export function debugDrawHitboxes(ctx: CanvasRenderingContext2D, pos: WorldPxPosition, objectLayer: ObjectLayer, camera: Camera) {
    ctx.save();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;

    const playerRect = getPlayerRect(pos);
    drawRect(ctx, playerRect, camera, "rgba(0, 255, 255, 0.9)");

    for (const obj of objectLayer) {
        const rect = getObjectHitRect(obj);
        if (!rect) continue;
        drawRectObj(ctx, rect, camera, "rgba(0,0,255,0.8)");
    }
    ctx.restore();
}

// NPC描画
export function debugDrawNpcsHitBox(ctx: CanvasRenderingContext2D, npcs: NpcData[], camera: Camera) {
    for (const npc of npcs) {
        drawRect(ctx, { pos: { x: npc.pos.x, y: npc.pos.y }, w: npc.w, h: npc.h }, camera, "lime");
    }
}

export function debugDrawZonesHitBox(ctx: CanvasRenderingContext2D, zones: ZonePx[], camera: Camera) {
    for (const zone of zones) {
        let color = "gray";
        switch (zone.type) {
            case ZoneType.ENTRY: color = "yellow"; break;
            case ZoneType.FIELD_ENEMY: color = "red"; break;
            case ZoneType.WALKABLE_ZONE: color = "lime"; break;
            case ZoneType.EVENT: color = "orange"; break;
            case ZoneType.WARP: color = "cyan"; break;
            case ZoneType.TRAP: color = "purple"; break;
        }
        drawRect(ctx, { pos: { x: zone.pos.x, y: zone.pos.y }, w: zone.w, h: zone.h }, camera, color);
    }
}

// プレイヤー前方矩形
export function getPlayerTalkRect(pos: WorldPxPosition, state: PlayerState): RectPx {
    let rect: RectPx = {
        pos: { ...pos },
        w: TALK_RECT_WIDTH,
        h: TALK_RECT_WIDTH
    };

    switch (state.direction) {
        case AppDirection.UP:
            rect.pos.x = pos.x - TALK_RECT_WIDTH / 2;
            rect.pos.y = pos.y - TALK_RECT_REACH - NORM_SIZE / 2;
            rect.w = TALK_RECT_WIDTH;
            rect.h = TALK_RECT_REACH;
            break;
        case AppDirection.DOWN:
            rect.pos.x = pos.x - TALK_RECT_WIDTH / 2;
            rect.pos.y = pos.y + NORM_SIZE / 2;
            rect.w = TALK_RECT_WIDTH;
            rect.h = TALK_RECT_REACH;
            break;
        case AppDirection.LEFT:
            rect.pos.x = pos.x - TALK_RECT_REACH - NORM_SIZE / 2;
            rect.pos.y = pos.y - TALK_RECT_WIDTH / 2;
            rect.w = TALK_RECT_REACH;
            rect.h = TALK_RECT_WIDTH;
            break;
        case AppDirection.RIGHT:
            rect.pos.x = pos.x + NORM_SIZE / 2;
            rect.pos.y = pos.y - TALK_RECT_WIDTH / 2;
            rect.w = TALK_RECT_REACH;
            rect.h = TALK_RECT_WIDTH;
            break;
    }
    return rect;
}

// プレイヤー前方矩形描画
export function debugDrawPlayerTalkRect(ctx: CanvasRenderingContext2D, pos: WorldPxPosition, state: PlayerState, camera: Camera) {
    const rect = getPlayerTalkRect(pos, state);
    drawRect(ctx, rect, camera, "red");
}

// Sign ヒットボックス
export function debugDrawSignHitboxes(ctx: CanvasRenderingContext2D, signs: SignData[], camera: Camera) {
    for (const sign of signs) {
        drawRect(ctx, { pos: { x: sign.pos.x, y: sign.pos.y }, w: (sign.w ?? 1), h: (sign.h ?? 1) }, camera, "rgba(54, 54, 71, 0.8)");
    }
}
// 汎用描画
function drawRect(ctx: CanvasRenderingContext2D, rect: RectPx, camera: Camera, color: string) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.pos.x - camera.x, rect.pos.y - camera.y, rect.w, rect.h);
    ctx.restore();
}

function drawRectObj(ctx: CanvasRenderingContext2D, rect: RectPx, camera: Camera, color: string) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.pos.x - camera.x, rect.pos.y - camera.y, rect.w, rect.h);
    ctx.restore();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// アイテム描画
export function debugDrawItems(ctx: CanvasRenderingContext2D, items: ItemData[], camera: Camera) {
    for (const item of items) {
        drawRect(ctx, { pos: { x: item.pos.x, y: item.pos.y }, w: item.w, h: item.h }, camera, "magenta");
    }
}