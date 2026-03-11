// src/renderer/game/map/type/WorldDefinition.ts

import { EnvironmentJson } from "../../../../../../shared/Json/map/MapJson";
import { World } from "../../../../../../shared/core/world";
import { ObjectLayer } from "../../../objects/objectLayer";
import { ItemData } from "../../../talkNPC/ItemData";
import { NpcData } from "../../../talkNPC/NPCData";
import { SignData } from "../../../talkNPC/SignData";
import { ZonePx } from "../../../../../../shared/type/ZonePx";

export interface WorldDefinition {
    world: World;
    objectLayer: ObjectLayer;
    zones: ZonePx[];

    npcs: NpcData[];
    signs: SignData[];
    items: ItemData[];

    environment?: EnvironmentJson;
}


export type BaseWorldDefinition = {
    world: World;
    objectLayer: ObjectLayer;
};
