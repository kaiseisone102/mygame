// src/renderer/router/useCase/interact/InteractUseCase.ts

import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { tryCollectItem } from "../../../../../renderer/game/map/talkNPC/CollectItemSystem";
import { tryInteractNpc, tryReadSign } from "../../../../../renderer/game/map/talkNPC/TalkNPCSystem";
import { ItemData } from "../../../../../renderer/game/map/talkNPC/ItemData";
import { NpcData } from "../../../../../renderer/game/map/talkNPC/NPCData";
import { SignData } from "../../../../../renderer/game/map/talkNPC/SignData";
import { WorldPxPosition, WorldTilePosition } from "../../../../../shared/type/playerPosition/posType";
import { PlayerState } from "../../../../../shared/type/PlayerState";

type InteractUseCaseEvent = {
    playerState: PlayerState,
    playerPos: WorldPxPosition,
    npcs: NpcData[];
    signs: SignData[];
    items: ItemData[];
}

export class InteractUseCase {

    constructor(
        private emitUI: (e: AppUIEvent) => void
    ) { }

    execute(input: InteractUseCaseEvent) {

        const { playerState, playerPos, npcs, signs, items } = input;

        // ① NPC
        const npcMessage = tryInteractNpc(playerState, playerPos, npcs);
        if (npcMessage) {
            this.emitUI({
                type: "NPC_INTERACT",
                message: [npcMessage]
            });
        }

        // ② Sign
        const signMessage = tryReadSign(playerState, playerPos, signs);
        if (signMessage) {
            this.emitUI({
                type: "READ_SIGN",
                message: [signMessage]
            });
        }

        // ③ Item
        const itemId = tryCollectItem(playerState, playerPos, items);
        if (itemId) {
            this.emitUI({
                type: "COLLECT_ITEM",
                item: items
            });
        }
        return null;
    }
}
