// src/shared/type/battle/trait/TraitType.ts

import { SkillPreset } from "../../../master/battle/type/SkillPreset";
import { TargetSpecifier } from "../BattleAction";
import { BattlerPort } from "../port/BattlerPort";
import { Skill } from "../skill/Skill";
import { CommandActionType } from "../TargetType";

/**
 * 敵・味方の耐性、個性
 */
export const TraitType = {
    RESIST: "RESIST",
    WEAKNESS: "WEAKNESS",
    UTILITY: "UTILITY"
} as const;
export type TraitType = typeof TraitType[keyof typeof TraitType]

export type DamageContext = {
    source: BattlerPort;
    target: BattlerPort;
    skill?: SkillPreset;
    damage: number;
};

export type HealContext = {
    source: BattlerPort;
    target: BattlerPort;
    skill?: SkillPreset;
    heal: number;
};

export type ActionContext = {
    actorId: string;
    skillId?: string;
    target?: TargetSpecifier;
    type: CommandActionType;
};