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

export interface ZoneJson {
    id: string;
    pos: WorldTilePosition;
    tw: number;
    th: number;
    block: boolean;
    type: keyof typeof ZoneType;
    image?: keyof typeof ImageKey;
}

export interface NpcJson {
    id: string;
    pos: WorldTilePosition;
    tw?: number;
    th?: number;
    direction: string;
    image: keyof typeof ImageKey;
    messageId: string;
}

export interface SignJson {
    id: string;
    pos: WorldTilePosition;
    tw?: number,
    th?: number,
    facing: string;
    image: keyof typeof ImageKey;
    messageId: string;
}

export interface ItemJson {
    id: string;
    pos: WorldTilePosition;
    tw: number;
    th: number;
    type: string;
    image: keyof typeof ImageKey;
}

export interface EnvironmentJson {
    weather: string;
    timeOfDay: string;
    background: string;
}
