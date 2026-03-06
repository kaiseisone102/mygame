// src/renderer/game/map/interaction/InteractionTarget.ts

import { NpcData } from "../talkNPC/NPCData";
import { SignData } from "../talkNPC/SignData";
import { ItemData } from "../talkNPC/ItemData";

export type InteractionTarget =
    | { type: "NPC"; npc: NpcData }
    | { type: "SIGN"; sign: SignData }
    | { type: "ITEM"; item: ItemData };
