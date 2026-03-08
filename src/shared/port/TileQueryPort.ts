import { BiomeId } from "../type/battle/enemy/BiomeId";
import { WorldTilePosition } from "../type/playerPosition/posType";
import { TileType } from "../type/tileType";

// 純粋なワールド問い合わせ
export interface TileQueryPort {
    getWorldSize(): { width: number, height: number };
    getTileType(pos: WorldTilePosition): TileType;
    getBiomeFromTile(tile: TileType): BiomeId;
}
