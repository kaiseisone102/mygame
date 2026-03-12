import { NORM_SIZE } from "../../../../shared/data/constants";
import { NpcJson } from "../../../../shared/Json/map/MapJson";
import { NpcData, NpcTileDto } from "../talkNPC/NPCData";
import { toAppDirection } from "./SignDtoMapper";
import { mapImageKey } from "./ZoneDtoMapper";

export function toNpcTile(dto: NpcJson): NpcTileDto {
    return {
        id: dto.id,
        pos: { tx: dto.pos.tx, ty: dto.pos.ty },
        tw: dto.tw ?? 1,
        th: dto.th ?? 1,
        direction: toAppDirection(dto.direction),
        messageId: dto.messageId,
        image: dto.image ? mapImageKey(dto.image) : undefined
    }
}

export function buildNpcs(npcTiles: NpcTileDto[]): NpcData[] {
    return npcTiles.map(npc => ({
        id: npc.id,
        pos: { x: npc.pos.tx * NORM_SIZE, y: npc.pos.ty * NORM_SIZE },
        w: npc.tw * NORM_SIZE,
        h: npc.th * NORM_SIZE,
        direction: npc.direction,
        messageId: npc.messageId,
        image: npc.image
    }));
}