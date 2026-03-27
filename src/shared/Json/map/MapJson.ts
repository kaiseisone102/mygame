// src/shared/json/map/MapJson.ts

import { ImageKey } from "../../type/ImageKey";
import { WorldTilePosition } from "../../type/playerPosition/posType";
import { ZoneType } from "../../type/ZoneType";

export interface MapJson {
    zones: Partial<Record<keyof typeof ZoneType, ZoneJson[]>>;

    npcs?: NpcJson[];
    signs?: SignJson[];
    items?: ItemJson[];
    environment?: EnvironmentJson;
}

export interface EventZoneObject {
    id: string;
    pos: WorldTilePosition;
    tw?: number;
    th?: number;
    image?: keyof typeof ImageKey;
}

export interface ZoneJson extends EventZoneObject {
    block: boolean;
    type: keyof typeof ZoneType;
}

export interface NpcJson extends EventZoneObject {
    name: string;
    direction: string;
    roles: string[];
    messageId?: string;
    shopId?: string;
}

export interface SignJson extends EventZoneObject {
    facing: string;
    messageId: string;
}

export interface ItemJson extends EventZoneObject {
    type: string;
}

export interface EnvironmentJson {
    weather: string;
    timeOfDay: string;
    background: string;
}
