// src/renderer/game/map/dto/ZoneDtoMapper.ts

import { ImageKey } from "../../../../shared/type/ImageKey";
import { ZoneJson } from "../../../../shared/Json/map/MapJson";
import { ZoneType } from "../../../../shared/type/ZoneType";
import { ZoneTileDto } from "../../../../shared/type/ZoneTileDto";
import { NORM_SIZE } from "../../../../shared/data/constants";
import { ZonePx } from "../../../../shared/type/ZonePx";

export function toZoneTile(typeKey: keyof typeof ZoneType, dto: ZoneJson): ZoneTileDto {
    return {
        id: dto.id,
        pos: { tx: dto.pos.tx, ty: dto.pos.ty },
        tw: dto.tw,
        th: dto.th,
        block: dto.block,
        type: ZoneType[typeKey],
        image: dto.image ? mapImageKey(dto.image) : undefined
    };
}

export function buildZones(zoneTile: ZoneTileDto[]): ZonePx[] {
    return zoneTile.map(zone => ({
        pos: { x: zone.pos.tx * NORM_SIZE, y: zone.pos.ty * NORM_SIZE },
        w: zone.tw * NORM_SIZE,
        h: zone.th * NORM_SIZE,
        block: zone.block,
        type: zone.type,
        image: zone.image,
        onEnter: zone.onEnter,
        onLeave: zone.onLeave,
        isPlayerInside: false,
    }));
}

export function mapImageKey(key?: keyof typeof ImageKey): ImageKey | undefined {
    if (!key) return undefined;
    return ImageKey[key];
}