// src/shared/master/battle/type/SkillPreset.ts

import { SkillEffectKind } from "../../../type/battle/skill/SkillEffect";
import { SkillCategory, TargetSide, EffectScope, Element } from "../../../type/battle/skill/skillFormula";
import { TargetType } from "../../../type/battle/TargetType";

export type SkillPreset = {
    id: string; // 識別用
    name: string; // ui用

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
};
