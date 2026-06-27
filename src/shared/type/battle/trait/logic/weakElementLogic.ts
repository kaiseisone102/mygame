// src/shared/type/battle/trait/logic/weakElementLogic.ts

import { Element } from "../../skill/skillFormula";
import { Trait } from "../Trait";
import { DamageContext } from "../TraitType";

/**
 * 属性耐性 Trait を作る
 * 例: FIRE耐性0.5なら damage * 0.5 にする
 */
export function resistElementLogic(
    element: Element,
    rate: number
): Partial<Trait> {
    return {
        onDamage: (ctx: DamageContext) => {
            // 属性は effect レベル(テクニックの攻撃タイプ等)を優先し、無ければ skill 直下
            const skillElement = ctx.element ?? ctx.skill?.element;
            if (skillElement === element) {
                return Math.floor(ctx.damage * rate);
            }
            return ctx.damage;
        },
    };
}
