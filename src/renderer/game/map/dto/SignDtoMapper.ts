import { AppDirection } from "../../../../shared/type/PlayerState";
import { SignJson } from "../../../../shared/Json/map/MapJson";
import { SignData, SignTileDto } from "../talkNPC/SignData";
import { mapImageKey } from "./ZoneDtoMapper";
import { NORM_SIZE } from "../../../../shared/data/constants";

export function toSignTile(dto: SignJson): SignTileDto {
    return {
        id: dto.id,
        pos: { tx: dto.pos.tx, ty: dto.pos.ty },
        tw: dto.tw ?? 1,
        th: dto.th ?? 1,
        facing: toAppDirection(dto.facing),
        message: dto.messageId ?? "",
        image: dto.image ? mapImageKey(dto.image) : undefined,
    };
}


export function buildSigns(signTiles: SignTileDto[]): SignData[] {
    return signTiles.map(sign => ({
        id: sign.id,
        pos: { x: sign.pos.tx * NORM_SIZE, y: sign.pos.ty * NORM_SIZE },
        w: sign.tw * NORM_SIZE,
        h: sign.th * NORM_SIZE,
        facing: sign.facing,
        message: sign.message,
        image: sign.image
    }));
}

export function toAppDirection(dir: string): AppDirection {
    const values = Object.values(AppDirection);

    if (values.includes(dir as AppDirection)) {
        return dir as AppDirection;
    }

    throw new Error(`Invalid AppDirection: ${dir}`);
}