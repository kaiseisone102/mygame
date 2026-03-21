// src/shared/type/battle/port/BattlerPort.ts

import { BaseStats } from "../../../data/playerConstants";
import { StatusId, StatusInstance } from "../../../master/battle/StatusPreset";
import { Trait } from "../trait/Trait";

export interface BattlerPort {
    actorMasterId: number;
    instanceId: number;
    name: string;
    baseStats: {
        hp: number;
        maxHp: number;
        mp: number;
    }
    alive: boolean;

    addHp(amount: number): void;
    addMp(amount: number): void;
}

export interface IBattler {
    readonly instanceId: number;
    readonly name: string;

    // ステータス参照
    readonly baseStats: BaseStats;
    readonly hp: number;
    readonly maxHp: number;

    readonly statusEffects: StatusInstance[];
    readonly traits: readonly Trait[];

    alive: boolean;

    // 操作メソッド (ロジックから呼びたいもの)
    addHp(amount: number): void;
    addMp(amount: number): void;
    removeStatus(id: StatusId): void;
    // 必要なら log メソッドなども
}