// src/shared/type/battle/BattleAction.ts

import { SkillPreset } from "../../master/battle/type/SkillPreset";
import { CommandActionType, TargetType } from "./TargetType";

export type BattleAction =
    | {
        type: typeof CommandActionType.ATTACK;
        actorId: number;
        skillId: string;
        target: TargetSpecifier;
    }
    | {
        type: typeof CommandActionType.MAGIC;
        actorId: number;
        skillId: string;
        target: TargetSpecifier;
    }
    | {
        type: typeof CommandActionType.ITEM;
        actorId: number;
        skill: SkillPreset;
        target: TargetSpecifier;
    }
    | {
        type: typeof CommandActionType.DEFENCE;
        actorId: number;
        skillId: string;
        target: TargetSpecifier;
    }
    | {
        type: typeof CommandActionType.ESCAPE;
        actorId: number;
        skillId: string;
        target: TargetSpecifier;
    };

export type TargetSpecifier =
    | { type: typeof TargetType.SINGLE_ENEMY; enemyId: number }
    | { type: typeof TargetType.GROUP_ENEMY; ids: number[] }
    | { type: typeof TargetType.ALL_ENEMIES }
    | { type: typeof TargetType.SINGLE_ALLY; actorId: number }
    | { type: typeof TargetType.SELF_AND_SINGLE_ALLY; actorId: number }
    | { type: typeof TargetType.ALL_ALLIES }
    | { type: typeof TargetType.SELF };


export const BattlerSide = {
    ALLY: "ALLY", ENEMY: "ENEMY",
} as const;
export type BattlerSide = typeof BattlerSide[keyof typeof BattlerSide];

export const ActionKind = {
    SKILL: "SKILL", ITEM: "ITEM"
} as const;
export type ActionKind = typeof ActionKind[keyof typeof ActionKind]

export type GrowthRates = {
    hp: number;
    mp: number;
    attack: number;
    defense: number;
    magic: number;
    speed: number;
};

export type LevelGrowthTable = Record<number, GrowthRates>;
// レベルごとの成長値を保持 {1: {hp:5, mp:2, ...}, 2: {...}}
