// src/shared/master/item/convertItemToSkill.ts

import { EffectScope, SkillCategory } from "../../type/battle/skill/skillFormula";
import { ItemPreset } from "../battle/ItemPreset";
import { SkillOccasion, SkillPreset } from "../battle/type/SkillPreset";

export function convertItemToSkill(item: ItemPreset): SkillPreset {
    return {
        id: item.id,
        name: item.name,
        occation: SkillOccasion.ALWAYS,
        category: SkillCategory.ITEM,
        cost: { mp: 0 },
        targetSide: undefined as any, // 必要なら決める
        targetType: item.targetType,
        effectScope: EffectScope.SINGLE, // targetTypeから判定してもよい
        effects: item.effects,
        description: item.description
    };
}