// src/shared/master/battle/type/SkillPreset.ts

import { SkillEffectKind } from "../../../type/battle/skill/SkillEffect";
import { SkillCategory, TargetSide, EffectScope, Element } from "../../../type/battle/skill/skillFormula";
import { TargetType } from "../../../type/battle/TargetType";

export type SkillPreset = {
    id: SkillId; // 識別用
    name: string; // UI用

    category: SkillCategory;
    cost?: {
        mp?: number;
        consumeItemId?: string;
        consumeAmount?: number;
    };

    targetSide: TargetSide;
    targetType: TargetType;
    effectScope: EffectScope;

    element?: Element;

    effects: readonly SkillEffectKind[];

    description: string; // UI用
};

export const TechniqueId = {
    ATTACK: "ATTACK",
    DOUBLE_ATTACK: "DOUBLE_ATTACK",
    POWER_SLASH: "POWER_SLASH",
    WHIRL_WIND: "WHIRL_WIND",
    BACK_STAB: "BACK_STAB",

    GUARD: "GUARD",
    PROVOKE: "PROVOKE",
    ESCAPE: "ESCAPE",

    LIMIT_BREAK: "LIMIT_BREAK",
} as const;
export type TechniqueId = typeof TechniqueId[keyof typeof TechniqueId];

export const MagicId = {
    MERA: "MERA",
    GIRA: "GIRA",
    IO: "IO",
    HYADO: "HYADO",
    RAIDEIN: "RAIDEIN",
    BAGI: "BAGI",

    HEAL: "HEAL",
    HEAL_ALL: "HEAL_ALL",
    REVIVE: "REVIVE",

    ATK_UP_SMALL: "ATK_UP_SMALL",
    ATK_UP_LARGE: "ATK_UP_LARGE",
    DEF_UP: "DEF_UP",
    HASTE: "HASTE",

    ATK_DOWN: "ATK_DOWN",
    SLOW: "SLOW",

    SLEEP: "SLEEP",
    POISON: "POISON",
    PARALYZE: "PARALYZE",

    GIGADEIN: "GIGADEIN"
} as const;
export type MagicId = typeof MagicId[keyof typeof MagicId];

export type SkillId = TechniqueId | MagicId;
