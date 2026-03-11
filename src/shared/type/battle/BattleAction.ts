// src/shared/type/battle/BattleAction.ts

import { BaseStats } from "../../data/playerConstants";
import { SkillId, SkillPreset } from "../../master/battle/type/SkillPreset";
import { CommandActionType, TargetType } from "./TargetType";

export type BattleAction =
    | {
        type: typeof CommandActionType.ATTACK;
        actorTemplateId: number;
        actorInstanceId: number;
        skill: SkillPreset;
        target: TargetSpecifier;
    }
    | {
        type: typeof CommandActionType.TECHNIQUE;
        actorTemplateId: number;
        actorInstanceId: number;
        skill: SkillPreset;
        target: TargetSpecifier;
    }
    | {
        type: typeof CommandActionType.MAGIC;
        actorTemplateId: number;
        actorInstanceId: number;
        skill: SkillPreset;
        target: TargetSpecifier;
    }
    | {
        type: typeof CommandActionType.ITEM;
        actorTemplateId: number;
        actorInstanceId: number;
        skill: SkillPreset;
        target: TargetSpecifier;
    }
    | {
        type: typeof CommandActionType.DEFENCE;
        actorTemplateId: number;
        actorInstanceId: number;
        skill: SkillPreset;
        target: TargetSpecifier;
    }
    | {
        type: typeof CommandActionType.ESCAPE;
        actorTemplateId: number;
        actorInstanceId: number;
        skill: SkillPreset;
        target: TargetSpecifier;
    };

export type TargetSpecifier =
    | { type: typeof TargetType.SINGLE_ENEMY; enemyInstanceId: number }
    | { type: typeof TargetType.GROUP_ENEMY; ids: number[] }
    | { type: typeof TargetType.ALL_ENEMIES, actorInstanceId: number }
    | { type: typeof TargetType.SINGLE_ALLY; actorInstanceId: number }
    | { type: typeof TargetType.SELF_AND_SINGLE_ALLY; actorInstanceId: number }
    | { type: typeof TargetType.ALL_ALLIES, actorInstanceId: number }
    | { type: typeof TargetType.SELF };


export const BattlerSide = {
    ALLY: "ALLY", ENEMY: "ENEMY",
} as const;
export type BattlerSide = typeof BattlerSide[keyof typeof BattlerSide];

export const ActionKind = {
    SKILL: "SKILL", ITEM: "ITEM"
} as const;
export type ActionKind = typeof ActionKind[keyof typeof ActionKind]

export type LevelGrowthTable = Record<number, Partial<BaseStats>>;
// レベルごとの成長値を保持 {1: {hp:5, mp:2, ...}, 2: {...}}

export type StrangeAction = {
    commandId: CommandActionType,
    actorTemplateId: number,
    actorInstanceId: number
    actorName: string,
    skillId: SkillId,
    target?: number
}