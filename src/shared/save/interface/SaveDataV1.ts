
import { MapId } from "../../type/MapId";
import { PlayerPxPosition } from "../../type/playerPosition/posType";
import { SaveDataBase } from "./SaveDataBase";

/**
 * SaveData V1（例：昔）
 */
export interface SaveDataV1 extends SaveDataBase {
    version: 1;
    playerName: string;
    level: number;
    hp: number;
    mp: number;
    currentMapId: MapId;
    where: PlayerPxPosition;
}
