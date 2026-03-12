// src/shared/type/move/WalkableResolver.ts
import { TileType } from "../tileType";

export type WalkableResolver = (
    tile: TileType,
    context: any
) => WalkResult;

export interface WalkResult {
    canWalk: boolean;
    speedModifier?: number;
    damage?: number;
}
