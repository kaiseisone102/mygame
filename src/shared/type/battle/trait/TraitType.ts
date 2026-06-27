// src/shared/type/battle/trait/TraitType.ts

import { SkillPreset } from "../../../master/battle/type/SkillPreset";
import { Element } from "../skill/skillFormula";
import { TargetSpecifier } from "../BattleAction";
import { BattlerPort } from "../port/BattlerPort";
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
    element?: Element;   // 解決済みの属性(effect.element 優先)。属性耐性 Trait はこれを見る
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