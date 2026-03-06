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
            if (ctx.skill?.element === element) {
                return Math.floor(ctx.damage * rate);
            }
            return ctx.damage;
        },
    };
}
