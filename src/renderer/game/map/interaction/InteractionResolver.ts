// src/renderer/game/map/interaction/InteractionResolver.ts

import { AppDirection, PlayerState } from "../../../../shared/type/PlayerState";
import { NpcData } from "../talkNPC/NPCData";
import { SignData } from "../talkNPC/SignData";
import { ItemData } from "../talkNPC/ItemData";
import { InteractionTarget } from "./InteractionTarget";
import { WorldPxPosition } from "../../../../shared/type/playerPosition/posType";
import { getPlayerTalkRect } from "../../../../renderer/module/debug/debugDrawPlayerHitbox";
import { NORM_SIZE } from "../../../../shared/data/constants";
import { RectPx } from "../objects/rect";

type InteractionContext = {
    npcs: NpcData[];
    signs: SignData[];
    items: ItemData[];
};

export class InteractionResolver {

    /**
     * プレイヤーの前方にいる対象を判定（矩形判定）
     */
    resolve(
        playerState: PlayerState,
        playerPos: WorldPxPosition,
        ctx: InteractionContext
    ): InteractionTarget | null {

        const talkRect: RectPx = getPlayerTalkRect(playerPos, playerState);

        // ① NPC優先
        const npc = ctx.npcs.find(n => {
            const npcRect: RectPx = {
                pos: { x: n.pos.x, y: n.pos.y },
                w: n.w ?? NORM_SIZE,
                h: n.h ?? NORM_SIZE,
            };
            return this.rectsOverlap(talkRect, npcRect);
        });
        if (npc) return { type: "NPC", npc };

        // ② Sign
        const sign = ctx.signs.find(s => this.canReadSign(talkRect, playerState.direction, s));
        if (sign) return { type: "SIGN", sign };

        // ③ Item
        const item = ctx.items.find(i => this.rectsOverlap(talkRect, {
            pos: { x: i.pos.x, y: i.pos.y },
            w: i.w ?? NORM_SIZE,
            h: i.h ?? NORM_SIZE,
        }));
        if (item) return { type: "ITEM", item };

        return null;
    }

    /** 矩形同士が重なっているか判定 */
    private rectsOverlap(a: RectPx, b: RectPx): boolean {
        return !(
            a.pos.x + a.w < b.pos.x ||
            a.pos.x > b.pos.x + b.w ||
            a.pos.y + a.h < b.pos.y ||
            a.pos.y > b.pos.y + b.h
        );
    }

    /** 看板向き判定 */
    private canReadSign(playerRect: RectPx, playerFacing: AppDirection, sign: SignData): boolean {
        const signRect: RectPx = {
            pos: { x: sign.pos.x, y: sign.pos.y },
            w: sign.w ?? NORM_SIZE,
            h: sign.h ?? NORM_SIZE,
        };
        if (!this.rectsOverlap(playerRect, signRect)) return false;

        const facingOK =
            (playerFacing === AppDirection.UP && sign.facing === AppDirection.DOWN) ||
            (playerFacing === AppDirection.DOWN && sign.facing === AppDirection.UP) ||
            (playerFacing === AppDirection.LEFT && sign.facing === AppDirection.RIGHT) ||
            (playerFacing === AppDirection.RIGHT && sign.facing === AppDirection.LEFT);

        return facingOK;
    }
}