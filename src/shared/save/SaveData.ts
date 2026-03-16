// src/shared/types/SaveData.ts

import { BattleState } from "../../renderer/game/battle/core/BattleState";
import { PlayerAbilities } from "../type/PlayerAbilitties";
import { MapId } from "../type/MapId";
import { PlayerPxPosition, WorldPxPosition } from "../type/playerPosition/posType";
import { BattlerSaveData } from "../data/BattlerSaveData";
import { BaseStats } from "../data/playerConstants";
import { SkillId } from "../master/battle/type/SkillPreset";

export interface SaveData {
    version: number;
    playerName: string;
    gold: number;
    party: BattlerSaveData[]; // パーティ全員の状態を保存

    // UI表示用に主人公のデータも残す
    level: number;
    exp: number;
    baseStats: BaseStats;
    skills: SkillId[];

    // 装備やアイテム
    equipment: Record<string, boolean>;
    items: Record<string, number>;
    currentMapId: MapId;
    where: PlayerPxPosition;
    eventFlags: { [mapId in MapId]?: Record<string, boolean> };
    collectedItems: Record<string, boolean>;
    currentBattleState?: BattleState;
    battleReturn?: { mapId: MapId, pos: WorldPxPosition };
    abilities: PlayerAbilities;
}
