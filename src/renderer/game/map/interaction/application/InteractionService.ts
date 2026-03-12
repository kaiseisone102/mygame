// src/renderer/game/map/interaction/application/InteractionService.ts

import { OverlayScreenType } from "../../../../../shared/type/screenType";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { InteractionTarget } from "../InteractionTarget";
import { MessageRepository } from "./message/MessageRepository";

export class InteractionService {

    constructor(private messageRepo: MessageRepository) { }

    toUIEvent(target: InteractionTarget): AppUIEvent {
        switch (target.type) {
            case "NPC":
                return this.npc(target.npc.messageId);

            case "SIGN":
                return this.sign(target.sign.messageId);

            case "ITEM":
                return this.item(target.item.id);
        }
    }

    private npc(messageId: string): AppUIEvent {
        const message = this.messageRepo.getMessage(messageId) ?? "...";
        return { type: "PUSH_OVERLAY", overlay: OverlayScreenType.MESSAGE_LOG, payload: { messages: [message] } };
    }

    private sign(messageId: string): AppUIEvent {
        const message = this.messageRepo.getMessage(messageId) ?? "...";
        return { type: "PUSH_OVERLAY", overlay: OverlayScreenType.MESSAGE_LOG, payload: { messages: [message] } };
    }

    private item(itemId: string): AppUIEvent {
        return { type: "PUSH_OVERLAY", overlay: OverlayScreenType.MESSAGE_LOG, payload: { messages: [`「${itemId}」を手に入れた！`] } };
    }
}