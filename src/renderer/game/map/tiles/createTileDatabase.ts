// src/renderer/game/map/tiles/createTileDatabase.ts

import { ImageKey } from "../../../../shared/type/ImageKey";
import { ImageStore } from "../../../../renderer/asset/ImageStore";
import { TileType } from "../../../../shared/type/tileType";
import { AbilityKey } from "../../../../shared/type/PlayerAbilitties";

export interface TileData {
    type: TileType;
    walkable: boolean;          // デフォで通行可か
    requires?: AbilityKey | AbilityKey[]; // 進行可能になる条件
    color?: string;             // テスト用色
    image?: HTMLImageElement;   // 画像
    damage?: number;            // 接触でダメージを受ける場合
    speedModifier?: number;     // 通過速度に補正
    encounterRateModifier?: number;    // 地形のエンカウント補正
}

export function createTileDatabase(): Record<TileType, TileData> {
    return {
        [TileType.PLAIN]: {
            type: TileType.PLAIN,
            walkable: true,
            image: ImageStore.get(ImageKey.PLAIN)
        },
        [TileType.DIRT]: {
            type: TileType.DIRT,
            walkable: true,
            image: ImageStore.get(ImageKey.DIRT)
        },
        [TileType.WOOD_FLOOR]: {
            type: TileType.WOOD_FLOOR,
            walkable: true,
            color: "#a1887f", // image: ImageStore.get("plain")
        },
        [TileType.WALL]: {
            type: TileType.WALL,
            walkable: false,
            image: ImageStore.get(ImageKey.WALL)
        },
        [TileType.WATER]: {
            type: TileType.WATER,
            walkable: true,              // 地形としては通れる
            requires: AbilityKey.SWIM,            // 泳げないと無理
            image: ImageStore.get(ImageKey.WATER),
            speedModifier: 0.5
        },
        [TileType.ROOF]: {
            type: TileType.ROOF,
            walkable: false,
            color: "rgb(39, 22, 1)", //image: ImageStore.get("plain")
        },
        [TileType.FOREST]: {
            type: TileType.FOREST,
            walkable: true, color: "rgba(36, 65, 21, 1)",
            image: ImageStore.get(ImageKey.WOODS),
            encounterRateModifier: 1.5,
        },
        // 洞窟
        [TileType.CAVEWALL]: {
            type: TileType.CAVEWALL,
            walkable: false,
            color: "#5e3703ff",
            image: ImageStore.get(ImageKey.CAVEWALL)
        },
        [TileType.CAVEFLOOR]: {
            type: TileType.CAVEFLOOR,
            walkable: true,
            color: "rgba(36, 65, 21, 1)",
            image: ImageStore.get(ImageKey.CAVEFLOOR)
        },
        [TileType.LAVA]: {
            type: TileType.LAVA,
            walkable: true, color: "rgb(143, 34, 34)",
            damage: 5,           // image: ImageStore.get("lava")
        },
        [TileType.DARK]: {
            type: TileType.DARK,
            walkable: false,
            color: "#72b7f3ff",
            image: ImageStore.get(ImageKey.DARK)
        },
        [TileType.SKY]: {
            type: TileType.SKY,
            walkable: true,
            color: "#72b7f3ff",
            image: ImageStore.get(ImageKey.SKY)
        },
    }
};
