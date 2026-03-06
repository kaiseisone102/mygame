// application/InteractionService.ts

import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { NpcData } from "../../talkNPC/NPCData";
import { ItemData } from "../../talkNPC/ItemData";
import { SignData } from "../../talkNPC/SignData";
import { InteractionTarget } from "../InteractionTarget";
import { MessageRepository } from "./message/MessageRepository";

export class InteractionService {

     constructor(
        private messageRepo: MessageRepository
    ) {}
    
    handle(target: InteractionTarget): AppUIEvent {

        switch (target.type) {

            case "NPC":
                return this.interactNpc(target.npc);

            case "SIGN":
                return this.interactSign(target.sign);

            case "ITEM":
                return this.interactItem(target.item);
        }
    }

    private interactNpc(npc: NpcData): AppUIEvent {

        const message = this.messageRepo.getMessage(npc.message);

        if (!message) {
            console.warn("Message not found:", npc.message);
            return { type: "OPEN_MESSAGE", messages: ["..."] };
        }

        return {
            type: "OPEN_MESSAGE",
            messages: [message]
        };
    }

    private interactSign(sign: SignData): AppUIEvent {

        const message = this.messageRepo.getMessage(sign.message);

        if (!message) {
            console.warn("Message not found:", sign.message);
            return { type: "OPEN_MESSAGE", messages: ["..."] };
        }

        return {
            type: "OPEN_MESSAGE",
            messages: [message]
        };
    }

    private interactItem(item: ItemData): AppUIEvent {

        return {
            type: "COLLECT_ITEM",
            itemId: item.id
        };
    }
}