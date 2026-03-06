// src/shared/type/battle/trait/logic/resistCategoryLogic.ts

import { SkillCategory } from "../../skill/skillFormula";
import { Trait } from "../Trait";
import { DamageContext } from "../TraitType";

/**
 * スキルカテゴリー耐性 Trait を作る
 * 例: 打撃耐性0.5なら damage * 0.5 にする
 */
export function resistCategoryLogic(
    category: SkillCategory,
    rate: number
): Partial<Trait> {
    return {
        onDamage: (ctx: DamageContext) => {
            if (ctx.skill?.category === category) {
                return Math.floor(ctx.damage * rate);
            }
            return ctx.damage;
        }
    };
}