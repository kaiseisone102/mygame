// src/renderer/game/map/registry/MapRegistry.ts

import { MapId } from "../../../../shared/type/MapId";
import { ForestTempleBuilder } from "../builder/map/ForestTempleBuilder";
import { GraveCaveBuilder } from "../builder/map/GraveCaveBuilder";
import { MapBuilder } from "../builder/interface/MapBuilder";
import { NoFeatureTownBuilder } from "../builder/map/NoFeatureTownBuilder";
import { WorldMapBuilder } from "../builder/map/WorldMapBuilder";
import { BuildingSquare } from "../tiles/placeBuildingSquare";

export class MapRegistry {

    private builders: Record<MapId, MapBuilder>;

    constructor(
        private forestTempleBuilder: ForestTempleBuilder,
        private noFeatureTownBuilder: NoFeatureTownBuilder,
        private graveCaveBuilder: GraveCaveBuilder,
        private worldMapBuilder: WorldMapBuilder,
    ) {
        this.builders = {
            [MapId.FOREST_TEMPLE]: this.forestTempleBuilder,
            [MapId.NO_FEATURE_TOWN]: this.noFeatureTownBuilder,
            [MapId.GRAVE_CAVE]: this.graveCaveBuilder,
            [MapId.WORLD_MAP]: this.worldMapBuilder,
        };
    }

    get(mapId: MapId): MapBuilder {

        const builder = this.builders[mapId];

        if (!builder) {
            throw new Error("MapBuilder not found: " + mapId);
        }

        return builder;
    }
}