
import { MapId } from "../../type/MapId";
import { PlayerPxPosition, WorldPxPosition } from "../../type/playerPosition/posType";
import { SaveDataBase } from "./SaveDataBase";

/**
 * SaveData V2（現在）
 */
export interface SaveDataV2 extends SaveDataBase {
    version: 2;

    playerName: string;
    level: number;
    exp: number;
    gold: number;

    hp: number;
    mp: number;
    pow: number;
    int: number;
    def: number;
    spd: number;
    luc: number;
    avo: number;
    crt: number;

    statusEffects: string[];
    skills: string[];

    equipment: Record<string, boolean>;
    items: Record<string, number>;

    currentMapId: MapId;
    where: PlayerPxPosition;

    abilities: { swim: boolean },

    eventFlags: { [mapId in MapId]?: Record<string, boolean> };
    collectedItems: Record<string, boolean>;

    playerPos: PlayerPxPosition;

    battleReturn?: { mapId: MapId, pos: WorldPxPosition };
}
