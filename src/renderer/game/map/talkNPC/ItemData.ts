import { ImageKey } from "../../../../shared/type/ImageKey";
import { WorldPxPosition, WorldTilePosition } from "../../../../shared/type/playerPosition/posType";

// アイテム（宝箱・回復アイテムなど）
export interface ItemData {
    id: string;
    pos: WorldPxPosition;
    w: number;
    h: number;
    type: FieldItem;    // "potion" | "gold" | "weapon" | "armor" など
    image?: ImageKey;
    onCollect?: () => void;
}

export interface ItemTileDto {
    id: string;
    pos: WorldTilePosition;
    tw: number;
    th: number;
    type: FieldItem;    // "potion" | "gold" | "weapon" | "armor" など
    image?: ImageKey;
    onCollect?: () => void;
}

export const FieldItem = {
    POTION: "POTION", MANA_POTION: "MANA_POTION", GOLD: "GOLD",
} as const;
export type FieldItem = typeof FieldItem[keyof typeof FieldItem];