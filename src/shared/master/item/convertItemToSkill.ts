// src/shared/master/item/convertItemToSkill.ts

import { EffectScope, SkillCategory } from "../../type/battle/skill/skillFormula";
import { ItemPreset } from "../battle/ItemPreset";
import { SkillPreset } from "../battle/type/SkillPreset";

export function convertItemToSkill(item: ItemPreset): SkillPreset {
    return {
        id: item.id,
        name: item.name,
        category: SkillCategory.ITEM,
        cost: { mp: 0 },
        targetSide: undefined as any, // 必要なら決める
        targetType: item.targetType,
        effectScope: EffectScope.SINGLE, // targetTypeから判定してもよい
        effects: item.effects,
    };
}