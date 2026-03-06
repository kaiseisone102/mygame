// src/renderer/game/map/WorldManager.ts

import { WorldTilePosition } from "../../../shared/type/playerPosition/posType";
import { TileQueryPort } from "../../../shared/port/TileQueryPort";
import { TileType } from "../../../shared/type/tileType";
import { WorldDefinition } from "./MapData/definition/WorldDefinition";

export class WorldManager implements TileQueryPort {

    private current!: WorldDefinition;

    // ScreenController に通知するコールバック
    private emitChange?: () => void;
    onChange(callback: () => void) {
        this.emitChange = callback;
    }

    getTileType(pos: WorldTilePosition): TileType {
        return this.current.world.getTileType(pos);
    }

    setWorld(def: WorldDefinition) {
        this.current = def;
    }

    get(): WorldDefinition {
        if (!this.current) throw new Error("World not initialized");
        return this.current;
    }
}
