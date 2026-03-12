// src/shared/type/battle/skill/SkillEffect.ts

import { BuffPresets } from "../../../master/battle/BuffPreset";
import { StatusPresets } from "../../../master/battle/StatusPreset";
import { StatusCategory } from "../status/StatusCategory";
import { StatusId } from "../status/StatusEffect";
import { Element, MagicFormulaId, PhysicalFormulaId, SkillEffectKindId } from "./skillFormula";

// SkillPreset の effects で利用
export type SkillEffectKind =
    | DamageEffect
    | {
        type: typeof SkillEffectKindId.HEAL;
        power: number
    }
    | {
        type: typeof SkillEffectKindId.STATUS; // ← 状態異常専用
        statusId: StatusId;
        status: StatusCategory
        chance: number; // 0~1
    }
    | {
        type: typeof SkillEffectKindId.BUFF;
        buffId: keyof typeof BuffPresets;
        value: number;
        turns: number;
    }
    | {
        type: typeof SkillEffectKindId.ESCAPE;
        chance: number;
    }

export type DamageEffect =
    | {
        type: typeof SkillEffectKindId.DAMAGE;
        formula: typeof PhysicalFormulaId.ATK_DEF;
        power: number;
        element?: Element;
    }
    | {
        type: typeof SkillEffectKindId.DAMAGE;
        formula: typeof PhysicalFormulaId.ATK_RATE;
        power: number;
        rate: number;
        element?: Element;
    }
    | {
        type: typeof SkillEffectKindId.DAMAGE;
        formula: typeof MagicFormulaId.MAGIC;
        power: number;
        element?: Element;
    }
    | {
        type: typeof SkillEffectKindId.DAMAGE;
        formula: typeof PhysicalFormulaId.FIXED;
        power: number;
        element?: Element;
    };
