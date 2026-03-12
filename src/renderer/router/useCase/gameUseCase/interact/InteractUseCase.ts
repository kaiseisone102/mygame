// src/renderer/router/useCase/interact/InteractUseCase.ts

import { WorldEvent } from "../../../../../renderer/router/WorldEvent";
import { InteractionService } from "../../../../../renderer/game/map/interaction/application/InteractionService";
import { InteractionResolver } from "../../../../../renderer/game/map/interaction/InteractionResolver";
import { ItemData } from "../../../../../renderer/game/map/talkNPC/ItemData";
import { NpcData } from "../../../../../renderer/game/map/talkNPC/NPCData";
import { SignData } from "../../../../../renderer/game/map/talkNPC/SignData";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { WorldPxPosition } from "../../../../../shared/type/playerPosition/posType";
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
        private emitWorld: (e: WorldEvent) => void,
        private emitUI: (e: AppUIEvent) => void,
        private resolver: InteractionResolver,
        private service: InteractionService,
    ) { }

    execute(input: InteractUseCaseEvent) {
        const { playerState, playerPos, npcs, signs, items } = input;

        // resolver で前方のターゲットを判定
        const target = this.resolver.resolve(playerState, playerPos, { npcs, signs, items });
        if (!target) return;

        switch (target.type) {
            case "NPC":
            case "SIGN":
                // 既存通り service で UIイベント作成
                this.emitUI(this.service.toUIEvent(target));
                break;

            case "ITEM":
                // 世界側に状態更新を通知
                this.emitWorld({ type: "ITEM_COLLECTED", item: target.item });

                // UI通知
                this.emitUI(this.service.toUIEvent(target));
                break;
        }
    }
}
