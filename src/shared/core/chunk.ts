// src/shared/core/chunk.ts

import { TileType } from "../type/tileType";
import { CHUNK_TILES } from "../data/constants";

export class Chunk {
    tiles: TileType[];

    constructor(defaultTile: TileType) {
        this.tiles = new Array(CHUNK_TILES * CHUNK_TILES).fill(defaultTile);
    }

    get(x: number, y: number): TileType {
        return this.tiles[y * CHUNK_TILES + x];
    }

    set(x: number, y: number, tile: TileType) {
        this.tiles[y * CHUNK_TILES + x] = tile;
    }
}
