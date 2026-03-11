// src/renderer/game/map/registry/MapRegistry.ts

import { MapId } from "../../../../shared/type/MapId";
import { ForestTempleBuilder } from "../builder/ForestTempleBuilder";
import { GraveCaveBuilder } from "../builder/GraveCaveBuilder";
import { MapBuilder } from "../builder/interface/MapBuilder";
import { NoFeatureTownBuilder } from "../builder/NoFeatureTownBuilder";
import { WorldMapBuilder } from "../builder/WorldMapBuilder";

export class MapRegistry {

    private static builders: Record<MapId, MapBuilder> = {
        [MapId.FOREST_TEMPLE]: new ForestTempleBuilder(),
        [MapId.NO_FEATURE_TOWN]: new NoFeatureTownBuilder(),
        [MapId.GRAVE_CAVE]: new GraveCaveBuilder(),
        [MapId.WORLD_MAP]: new WorldMapBuilder(),
    };

    static get(mapId: MapId): MapBuilder {

        const builder = this.builders[mapId];

        if (!builder) {
            throw new Error("MapBuilder not found: " + mapId);
        }

        return builder;
    }
}