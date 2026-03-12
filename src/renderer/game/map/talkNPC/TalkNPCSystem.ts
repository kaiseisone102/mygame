// src/renderer/game/map/talkNPC/TalkNPCSystem.ts

import { WorldPxPosition } from "../../../../shared/type/playerPosition/posType";
import { getPlayerTalkRect } from "../../../../renderer/module/debug/debugDrawPlayerHitbox";
import { NORM_SIZE } from "../../../../shared/data/constants";
import { AppDirection, PlayerState } from "../../../../shared/type/PlayerState";
import { RectPx } from "../objects/rect";
import { NpcData } from "./NPCData";
import { SignData } from "./SignData";

/**
 * プレイヤーの前にいるNPCの messageId を返す
 * 見つからなければ null
 */
export function findNpcInFront(
    playerState: PlayerState,
    playerPos: WorldPxPosition,
    npcs: NpcData[]
): string | null {
    const talkRect: RectPx = getPlayerTalkRect(playerPos, playerState);
    const npc = npcs.find(n => {
        const npcRect: RectPx = {
            pos: { x: n.pos.x, y: n.pos.y },
            w: n.w ?? NORM_SIZE,
            h: n.h ?? NORM_SIZE,
        };
        return rectsOverlap(talkRect, npcRect);
    });

    return npc?.messageId ?? null;
}

/**
 * プレイヤーの前にある看板の messageId を返す
 * 見つからなければ null
 */
export function findSignInFront(
    playerState: PlayerState,
    playerPos: WorldPxPosition,
    signs: SignData[]
): string | null {
    const talkRect: RectPx = getPlayerTalkRect(playerPos, playerState);
    const sign = signs.find(s => canReadSign(talkRect, playerState.direction, s));
    return sign?.messageId ?? null;
}

// 矩形同士が重なっているか判定
export function rectsOverlap(a: RectPx, b: RectPx): boolean {
    return !(
        a.pos.x + a.w < b.pos.x ||
        a.pos.x > b.pos.x + b.w ||
        a.pos.y + a.h < b.pos.y ||
        a.pos.y > b.pos.y + b.h
    );
}

// 看板向き判定
function canReadSign(playerRect: RectPx, playerFacing: AppDirection, sign: SignData): boolean {
    const signRect: RectPx = {
        pos: { x: sign.pos.x, y: sign.pos.y },
        w: (sign.w ?? NORM_SIZE),
        h: (sign.h ?? NORM_SIZE),
    };
    if (!rectsOverlap(playerRect, signRect)) return false;

    const facingOK =
        (playerFacing === AppDirection.UP && sign.facing === AppDirection.DOWN) ||
        (playerFacing === AppDirection.DOWN && sign.facing === AppDirection.UP) ||
        (playerFacing === AppDirection.LEFT && sign.facing === AppDirection.RIGHT) ||
        (playerFacing === AppDirection.RIGHT && sign.facing === AppDirection.LEFT);

    return facingOK;
}
