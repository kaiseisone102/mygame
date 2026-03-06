// Skill.ts

import { BuffPresets } from "../../../master/battle/BuffPreset";
import { StatusPresets } from "../../../master/battle/StatusPreset";
import { BattlerPort } from "../port/BattlerPort";
import { SkillPort } from "../port/skillPort";
import { StatusCategory } from "../status/StatusCategory";
import { TargetType } from "../TargetType";
import { DamageFormula, Element, TargetSide, EffectScope, SkillEffectKindId } from "./skillFormula";

export type SkillEffect =
    | {
        type: typeof SkillEffectKindId.DAMAGE;
        formula: DamageFormula;
        power: number;         // 0 は攻撃威力に依存
        rate?: number;        // ATK_RATE 用 
        element?: Element;
    }
    | {
        type: typeof SkillEffectKindId.HEAL;
        power: number
    }
    | {
        type: typeof SkillEffectKindId.STATUS; // ← 状態異常専用
        statusId: keyof typeof StatusPresets;
        status: StatusCategory;
        chance: number; // 0~1
    }
    | {
        type: typeof SkillEffectKindId.BUFF;
        buffId: keyof typeof BuffPresets;
        value: number;
        turns: number;
    }
    | { type: "SPECIAL"; handler: (actor: BattlerPort, target: BattlerPort) => void };


export type Skill = SkillPort & {
    id: string;
    name: string;

    cost?: {
        mp?: number;
        consumeItemId?: string;
        consumeAmount?: number;
    };

    targetSide: TargetSide;
    targetType: TargetType;
    effectScope: EffectScope;

    effects: SkillEffect[];
};