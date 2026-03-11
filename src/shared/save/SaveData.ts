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
    // 基本情報
    playerName: string;
    level: number;
    exp: number;
    gold: number;

    // 戦闘用ステータス
    baseStats: BaseStats;

    // 戦闘システム拡張用（オプション）
    statusEffects: string[]; // 状態異常やバフ/デバフ
    skills: SkillId[];        // 覚えているスキル

    // 装備やアイテム
    equipment: Record<string, boolean>;
    items: Record<string, number>;

    currentMapId: MapId;
    where: PlayerPxPosition;

    abilities: PlayerAbilities;

    eventFlags: { [mapId in MapId]?: Record<string, boolean> };
    collectedItems: Record<string, boolean>;

    playerPos: PlayerPxPosition;

    currentBattleState?: BattleState;
    battleReturn?: { mapId: MapId, pos: WorldPxPosition };

    party: BattlerSaveData[];
}
