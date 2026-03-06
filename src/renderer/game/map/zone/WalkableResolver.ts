// src/shared/game/WalkableResolver.ts
import { TileType } from "../../../../shared/type/tileType";

export type WalkableResolver = (
  tile: TileType,
  context: any
) => WalkResult;

export interface WalkResult {
    canWalk: boolean;
    speedModifier?: number;
    damage?: number;
}
