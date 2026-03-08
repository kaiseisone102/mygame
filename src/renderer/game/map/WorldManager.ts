// src/renderer/game/map/WorldManager.ts

import { WorldTilePosition } from "../../../shared/type/playerPosition/posType";
import { TileQueryPort } from "../../../shared/port/TileQueryPort";
import { TileType } from "../../../shared/type/tileType";
import { WorldDefinition } from "./MapData/definition/WorldDefinition";
import { BiomeId, TileBiomeMap } from "../../../shared/type/battle/enemy/BiomeId";

export class WorldManager implements TileQueryPort {

    private currentDef!: WorldDefinition;

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

    get(): WorldDefinition {
        if (!this.currentDef) throw new Error("World not initialized");
        return this.currentDef;
    }

    getBiomeFromTile(tile: TileType): BiomeId {
        return TileBiomeMap[tile];
    }
}
