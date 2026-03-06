import { TileType } from "../../shared/type/tileType";
import { Enemy } from "../game/map/MapData/interface/MapData";
import { PlayerState } from "../../shared/type/PlayerState";

export interface ZoneQueryPort {
    getTileType(x: number, y: number): TileType;
    getEnemyAt(x: number, y: number): Enemy | null;
    canEnterZone(zoneId: string): boolean;
    getPlayerState(): PlayerState;
}
