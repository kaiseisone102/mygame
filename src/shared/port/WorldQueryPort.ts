import { TileType } from "../type/tileType";

// src/shared/port/WorldQueryPort.ts
export interface WorldQueryPort {
    getTileType(tx: number, ty: number): TileType;
}
