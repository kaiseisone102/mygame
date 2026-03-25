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

    async execute(input: InteractUseCaseEvent) {
        const { playerState, playerPos, npcs, signs, items } = input;

        // resolver で前方のターゲットを判定
        const target = this.resolver.resolve(playerState, playerPos, { npcs, signs, items });
        if (!target) return;

        switch (target.type) {
            case "NPC":
                for (const role of target.npc.roles) {
                    if (role === "TALK" && target.npc.messageId) {
                        // 会話が終わるまで await で待つ
                        await this.emitUI(this.service.createTalkEvent(target.npc.messageId));
                    }

                    if (role === "SHOP" && target.npc.shopId) {
                        // 「はい/いいえ」の選択を待つ
                        const confirmed = await new Promise<boolean>((resolve) => {
                            this.emitUI({
                                type: "OPEN_YES_NO",
                                message: "ショップを開きますか？",
                                onYes: () => {
                                    this.emitUI({ type: "POP_OVERLAY" }); this.emitUI({ type: "POP_OVERLAY" });
                                    resolve(true);
                                },
                                onNo: () => {
                                    this.emitUI({ type: "POP_OVERLAY" }); this.emitUI({ type: "POP_OVERLAY" });
                                    resolve(false);
                                },
                            });
                        });

                        // 「いいえ」ならここで終了（次の role に行かない、またはショップを開かない）
                        if (!confirmed) return;

                        // はいの場合、ショップを開く
                        const shopEvent = this.service.createShopEvent(target.npc.shopId);
                        await this.emitUI(shopEvent);
                    }
                }
                break;

            case "SIGN":
                // 既存通り service で UIイベント作成
                this.emitUI(this.service.createTalkEvent(target.sign.messageId));
                break;

            case "ITEM":
                // 世界側に状態更新を通知
                this.emitWorld({ type: "ITEM_COLLECTED", item: target.item });

                // UI通知
                this.emitUI(this.service.createTalkEvent(target.item.id));
                break;
        }
    }
}
