// src/renderer/game/map/MapData/createWorldDefinition.ts

import { MapId } from "../../../../../shared/type/MapId";
import { createForestTempleDefinition } from "./createForestTempleDefinition";
import { createGraveCaveDefinition } from "./createGraveCaveDefinition";
import { createTownDefinition } from "./createTownDefinition";
import { createWorldMapDefinition } from "./createWorldMapDefinition";
import { WorldDefinition } from "./WorldDefinition";

export function createWorldDefinition(mapId: MapId): WorldDefinition {
    switch (mapId) {
        case MapId.FOREST_TEMPLE:
            return createForestTempleDefinition();
        case MapId.WORLD_MAP:
            return createWorldMapDefinition();
        case MapId.NO_FEATURE_TOWN:
            return createTownDefinition();
        case MapId.GRAVE_CAVE:
            return createGraveCaveDefinition();
        default:
            throw new Error("Unknown worldId: " + mapId);
    }
}
