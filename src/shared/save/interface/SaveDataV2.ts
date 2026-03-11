
import { BattlerSaveData } from "../../data/BattlerSaveData";
import { BaseStats } from "../../data/playerConstants";
import { SkillId } from "../../master/battle/type/SkillPreset";
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

    baseStats: BaseStats;

    statusEffects: string[];
    skills: SkillId[];

    equipment: Record<string, boolean>;
    items: Record<string, number>;

    currentMapId: MapId;
    where: PlayerPxPosition;

    abilities: { swim: boolean },

    eventFlags: { [mapId in MapId]?: Record<string, boolean> };
    collectedItems: Record<string, boolean>;

    playerPos: PlayerPxPosition;

    battleReturn?: { mapId: MapId, pos: WorldPxPosition };

    party: BattlerSaveData[];
}
