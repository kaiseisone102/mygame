// src/shared/type/Zone.ts

import { EncounterTable } from "../master/battle/type/EncounterTable";
import { ImageKey } from "./ImageKey";
import { WorldPxPosition } from "./playerPosition/posType";
import { ZoneType } from "./ZoneType";

export interface ZonePx {
    pos: WorldPxPosition;
    w: number;      // tile幅
    h: number;     // tile高さ
    block: boolean;     // 通れるかどうか
    type: ZoneType;
    image?: ImageKey;   // 描画用画像
    // 内部管理用
    isPlayerInside?: boolean;

    id?: string;

    encounterRate?: number;
    // 追加してみた不要かも
    message?: string;
    encounter?: EncounterTable;
}
