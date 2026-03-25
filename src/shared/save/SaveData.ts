// src/shared/types/SaveData.ts

import { BattleState } from "../../renderer/game/battle/core/BattleState";
import { PlayerAbilities } from "../type/PlayerAbilitties";
import { MapId } from "../type/MapId";
import { PlayerPxPosition, WorldPxPosition } from "../type/playerPosition/posType";
import { BattlerSaveData } from "../data/BattlerSaveData";

export interface SaveData {
    version: number;
    playerName: string;
    gold: number;
    party: BattlerSaveData[]; // パーティ全員の状態を保存

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
