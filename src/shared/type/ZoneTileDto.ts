// src/renderer/game/map/zone/ZoneSeed.ts

import type { ImageKey } from "./ImageKey";
import type { ZoneType } from "./ZoneType";
import { EncounterTable } from "../master/battle/type/EncounterTable";
import { WorldTilePosition } from "./playerPosition/posType";

export interface ZoneTileDto {
    pos: WorldTilePosition;         // T単位y座標
    tw: number;
    th: number;
    block: boolean;
    type: ZoneType;
    image?: ImageKey;

    onEnter?: () => void;       // 町・エリア用
    onLeave?: () => void;
    onInteract?: () => void;    // NPC用

    // 内部管理用
    isPlayerInside?: boolean;

    // イベント用
    id?: string;
    message?: string;
    encounter?: EncounterTable;
}
