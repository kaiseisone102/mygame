import { WorldTilePosition } from "../type/playerPosition/posType";
import { TileType } from "../type/tileType";

// 純粋なワールド問い合わせ
export interface TileQueryPort {
    getTileType(pos: WorldTilePosition): TileType;
}