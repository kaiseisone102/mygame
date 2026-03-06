import { MapId } from "../MapId";

// タイル座標
export type PlayerTilePosition = Record<MapId, WorldTilePosition>;
export type WorldTilePosition = { tx: number, ty: number };
// Px座標
export type PlayerPxPosition = Record<MapId, WorldPxPosition>;
export type WorldPxPosition = { x: number, y: number };
