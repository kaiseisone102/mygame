import { WorldTilePosition } from "../type/playerPosition/posType";
import { TileType } from "../type/tileType";

// src/shared/port/WorldQueryPort.ts
export interface WorldQueryPort {
    getTileType(pos: WorldTilePosition): TileType;
}
