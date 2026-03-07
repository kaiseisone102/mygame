import { EnemyTemplateId } from "../../../Json/enemy/EnemyTemplate";
import { TileType } from "../../tileType";

export const BiomeId = {
    FOREST: "FOREST", PLAIN: "PLAIN", CAVE: "CAVE"
} as const;
export type BiomeId = typeof BiomeId[keyof typeof BiomeId];

export type EncounterTableJson = Record<BiomeId, EnemyTemplateId[]>;

export const TileBiomeMap: Record<TileType, BiomeId> = {
    [TileType.PLAIN]: BiomeId.PLAIN,
    [TileType.DIRT]: BiomeId.PLAIN,
    [TileType.WOOD_FLOOR]: BiomeId.PLAIN,

    [TileType.FOREST]: BiomeId.FOREST,

    [TileType.WALL]: BiomeId.PLAIN,
    [TileType.WATER]: BiomeId.PLAIN,
    [TileType.ROOF]: BiomeId.PLAIN,

    [TileType.CAVEWALL]: BiomeId.CAVE,
    [TileType.CAVEFLOOR]: BiomeId.CAVE,
    [TileType.LAVA]: BiomeId.CAVE,
    [TileType.DARK]: BiomeId.CAVE,
    [TileType.SKY]: BiomeId.PLAIN
};