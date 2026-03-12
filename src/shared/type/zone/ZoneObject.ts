import { WorldPxPosition } from "../playerPosition/posType";
import { ZoneType } from "../ZoneType";

export interface ZoneObject {
    id?: string;
    type: ZoneType;          // ENTRY, FIELD_ENEMY, WALKABLE_ZONE, NPC, ITEM ...
    pos: WorldPxPosition; // px座標
    w: number;             // px幅
    h: number;             // px高さ
    block?: boolean;       // 歩行ブロック
    image?: string;
    extra?: any;           // メッセージなど
    isPlayerInside?: boolean; // 内部フラグ
}
