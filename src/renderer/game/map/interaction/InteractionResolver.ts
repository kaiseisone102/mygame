// src/renderer/game/map/interaction/InteractionResolver.ts

import { AppDirection, PlayerState } from "../../../../shared/type/PlayerState";
import { NpcData } from "../talkNPC/NPCData";
import { SignData } from "../talkNPC/SignData";
import { ItemData } from "../talkNPC/ItemData";
import { InteractionTarget } from "./InteractionTarget";

type InteractionContext = {
    npcs: NpcData[];
    signs: SignData[];
    items: ItemData[];
};

export class InteractionResolver {

    resolve(
        playerState: PlayerState,
        playerPos: { tx: number; ty: number },
        ctx: InteractionContext
    ): InteractionTarget | null {

        const { tx, ty } = this.getFrontTile(playerState, playerPos);

        // ① NPC優先
        const npc = ctx.npcs.find(n => n.tx === tx && n.ty === ty);
        if (npc) return { type: "NPC", npc };

        const sign = ctx.signs.find(s => s.tx === tx && s.ty === ty);
        if (sign) return { type: "SIGN", sign };

        const item = ctx.items.find(i => i.tx === tx && i.ty === ty);
        if (item) return { type: "ITEM", item };

        return null;
    }

    private getFrontTile(
        state: PlayerState,
        pos: { tx: number; ty: number }
    ) {
        switch (state.direction) {
            case AppDirection.UP: return { tx: pos.tx, ty: pos.ty - 1 };
            case AppDirection.DOWN: return { tx: pos.tx, ty: pos.ty + 1 };
            case AppDirection.LEFT: return { tx: pos.tx - 1, ty: pos.ty };
            case AppDirection.RIGHT: return { tx: pos.tx + 1, ty: pos.ty };
        }
    }
}

onInteract: (overlay: MessageLogOverlayController) => Promise<void>;