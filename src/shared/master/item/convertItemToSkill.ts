// src/shared/master/item/convertItemToSkill.ts

import { EffectScope, SkillCategory } from "../../type/battle/skill/skillFormula";
import { ItemPreset } from "../battle/ItemPreset";
import { SkillId, SkillOccasion, SkillPreset } from "../battle/type/SkillPreset";

export function convertItemToSkill(item: ItemPreset): SkillPreset {
    return {
        id: item.id as unknown as SkillId, // 道具IDは skillRepository を通さないため SkillId と衝突しない
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