// src/shared/types/SaveData.ts

import { BattleState } from "../../renderer/game/battle/core/BattleState";
import { PlayerAbilities } from "../type/PlayerAbilitties";
import { MapId } from "../type/MapId";
import { PlayerPxPosition, PlayerTilePosition, WorldPxPosition, WorldTilePosition } from "../type/playerPosition/posType";

export interface SaveData {
    version: number;
    // 基本情報
    playerName: string;
    level: number;
    exp: number;
    gold: number;

    // 戦闘用ステータス
    hp: number;
    mp: number;
    pow: number;
    int: number;
    def: number;
    spd: number;
    luc: number;
    avo: number;
    crt: number;

    // 戦闘システム拡張用（オプション）
    statusEffects: string[]; // 状態異常やバフ/デバフ
    skills: string[];        // 覚えているスキル

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
}
