// src/renderer/game/map/talkNPC/TalkNPCSystem.ts

import { WorldPxPosition, WorldTilePosition } from "../../../../shared/type/playerPosition/posType";
import { getPlayerTalkRect } from "../../../../renderer/module/debug/debugDrawPlayerHitbox";
import { NORM_SIZE } from "../../../../shared/data/constants";
import { AppDirection, PlayerState } from "../../../../shared/type/PlayerState";
import { RectPx, RectTile } from "../objects/rect";
import { NpcData } from "./NPCData";
import { SignData } from "./SignData";

export function tryInteractNpc(
    playerState: PlayerState,
    playerPos: WorldPxPosition,
    npcs: NpcData[],
): string {
    const talkRect: RectPx = getPlayerTalkRect(playerPos, playerState); // GameState からの位置取得は呼び出し側で
    const npc = npcs.find(n => {
        const npcRect: RectPx = {
            pos: { x: n.pos.x, y: n.pos.y },
            w: (n.w ?? NORM_SIZE),
            h: (n.h ?? NORM_SIZE),
        };
        return rectsOverlap(talkRect, npcRect);
    });

    if (npc) {
        console.log(`✅ NPC found at (${npc.pos.x}, ${npc.pos.y}), direction: ${npc.direction}`);
        return npc.message ?? "…";
    } else {
        console.log("❌ no NPC in front");
        return "";
    }
}

export function tryReadSign(
    playerState: PlayerState,
    playerPos: WorldPxPosition,
    signs: SignData[],
): string {
    const talkRect: RectPx = getPlayerTalkRect(playerPos, playerState);
    const sign = signs.find(s => canReadSign(talkRect, playerState.direction, s));

    if (sign) {
        console.log(`📜 Sign read at (${sign.pos.x}, ${sign.pos.y}), facing: ${sign.facing}`);
        return sign.message ?? "…";
    } else {
        console.log("❌ no sign in front");
        return "";
    }
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
        pos: { x: sign.pos.x, y: sign.pos.y},
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
