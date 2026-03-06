import { NORM_SIZE } from "../../../../shared/data/constants";
import { ItemJson } from "../../../../shared/map/MapJson";
import { ItemData, FieldItem, ItemTileDto } from "../talkNPC/ItemData";
import { mapImageKey } from "./ZoneDtoMapper";

export function toItemTile(dto: ItemJson): ItemTileDto {
    return {
        id: dto.id,
        pos: { tx: dto.pos.tx, ty: dto.pos.ty },
        tw: dto.tw,
        th: dto.th,
        type: toFieldItem(dto.type),
        image: dto.image ? mapImageKey(dto.image) : undefined,
    };
}

export function buildItems(itemTiles: ItemTileDto[]): ItemData[] {
    return itemTiles.map(item => ({
        id: item.id,
        pos: { x: item.pos.tx * NORM_SIZE, y: item.pos.ty * NORM_SIZE },
        w: item.tw * NORM_SIZE,
        h: item.th * NORM_SIZE,
        type: item.type,
        image: item.image
    }));
}

function toFieldItem(type: string): FieldItem {
    const values = Object.values(FieldItem);

    if (values.includes(type as FieldItem)) {
        return type as FieldItem;
    }

    throw new Error(`Unknown FieldItem type: ${type}`);
}
