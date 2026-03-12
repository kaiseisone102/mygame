// src/shared/type/ZoneEvents.ts

import { GameState } from "../data/gameState";
import { BiomeId } from "./battle/enemy/BiomeId";
import { MapId } from "./MapId";
import { WorldPxPosition } from "./playerPosition/posType";
import { PlayerState } from "./PlayerState";
import { ZoneObject } from "./zone/ZoneObject";

export type ZoneEnterEvent = {
    zone: ZoneObject,
    ctx: ZoneContext;
}

export interface ZoneEventMap {
    ZONE_ENTER_TOWN: ZoneEnterEvent;
    ZONE_ENTER_ENEMY: ZoneEnterEvent;
    ZONE_ENTER_EVENT: ZoneEnterEvent;
    ZONE_ENTER_WARP: ZoneEnterEvent;
    REQUEST_RANDOM_ENCOUNTER: TileStepContext;
}

export interface ZoneContext {
    pos: WorldPxPosition
    player: PlayerState;
    gameState: GameState;
    mapId: MapId;
    biomeId: BiomeId;
}

export type TileStepContext = {
    mapId: MapId;
    pos: WorldPxPosition;
    biomeId: BiomeId;
};