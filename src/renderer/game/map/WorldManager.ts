// src/renderer/game/map/WorldManager.ts

import { WorldTilePosition } from "../../../shared/type/playerPosition/posType";
import { TileQueryPort } from "../../../shared/port/TileQueryPort";
import { TileType } from "../../../shared/type/tileType";
import { WorldDefinition } from "./builder/interface/definition/WorldDefinition";
import { BiomeId, TileBiomeMap } from "../../../shared/type/battle/enemy/BiomeId";
import { MapId } from "../../../shared/type/MapId";

export class WorldManager implements TileQueryPort {

    private currentDef!: WorldDefinition;
    // テスト用
    private maps: MapId[] = [
        MapId.FOREST_TEMPLE,
        MapId.WORLD_MAP,
        MapId.NO_FEATURE_TOWN,
        MapId.GRAVE_CAVE
    ];
    // テスト用
    private index = 0;

    getWorldSize(): { width: number; height: number; } {
        if (!this.currentDef) throw new Error("WorldManager hadnt WorldDef")
        return { width: this.currentDef.world.width, height: this.currentDef.world.height }
    }

    getTileType(pos: WorldTilePosition): TileType {
        return this.currentDef.world.getTileType(pos);
    }

    setWorld(def: WorldDefinition) {
        this.currentDef = def;
    }

    getWorld(): WorldDefinition {
        if (!this.currentDef) throw new Error("World not initialized");
        return this.currentDef;
    }

    getBiomeFromTile(tile: TileType): BiomeId {
        return TileBiomeMap[tile];
    }

    // テスト用
    testNextMap() {
        this.index = (this.index + 1) % this.maps.length;
        return this.maps[this.index];
    }
}
