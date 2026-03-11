import { EnemyKey } from "../../../Json/enemy/EnemyTemplateJson";
import { TileType } from "../../tileType";

export const BiomeId = {
    FOREST: "FOREST", PLAIN: "PLAIN", CAVE: "CAVE", DEEPER_CAVE: "DEEPER_CAVE", WATER: "WATER"
} as const;
export type BiomeId = typeof BiomeId[keyof typeof BiomeId];

export type EncounterTableJson = Record<BiomeId, EnemyKey[]>;

export const TileBiomeMap: Record<TileType, BiomeId> = {
    [TileType.PLAIN]: BiomeId.PLAIN,
    [TileType.DIRT]: BiomeId.PLAIN,
    [TileType.WOOD_FLOOR]: BiomeId.PLAIN,

    [TileType.FOREST]: BiomeId.FOREST,

    [TileType.WALL]: BiomeId.PLAIN,
    [TileType.WATER]: BiomeId.WATER,
    [TileType.ROOF]: BiomeId.PLAIN,

    [TileType.CAVEWALL]: BiomeId.CAVE,
    [TileType.CAVEFLOOR]: BiomeId.CAVE,
    [TileType.LAVA]: BiomeId.DEEPER_CAVE,
    [TileType.DARK]: BiomeId.CAVE,
    [TileType.SKY]: BiomeId.PLAIN
};