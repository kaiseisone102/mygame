// src/renderer/game/battle/logic/traits/TraitRunner.ts

import { Battler } from "../../core/Battler";
import { BattleAction } from "../../../../../shared/type/battle/BattleAction";
import { Trait } from "../../../../../shared/type/battle/trait/Trait";
import { DamageContext } from "../../../../../shared/type/battle/trait/TraitType";
import { SkillPreset } from "../../../../../shared/master/battle/type/SkillPreset";

export class TraitRunner {
    static applyDamageTraits(
        ctx: DamageContext,
        traits: Trait[]
    ): number {
        return traits.reduce((damage, trait) => {
            if (!trait.onDamage) return damage;
            return trait.onDamage({ ...ctx, damage });
        }, ctx.damage);
    }

    static applyHealTraits(
        ctx: { source: Battler; target: Battler; skill: SkillPreset; heal: number },
        traits: Trait[]
    ): number {
        return traits.reduce((heal, trait) => {
            if (!trait.onHeal) return heal;
            return trait.onHeal({ ...ctx, heal });
        }, ctx.heal);
    }

    static applyMpCost(
        cost: number,
        skill: SkillPreset,
        traits: Trait[]
    ): number {
        return traits.reduce((c, trait) => {
            if (!trait.onMpCost) return c;
            return trait.onMpCost(c, skill);
        }, cost);
    }

    static onTurnStart(battler: Battler) {
        battler.traits.forEach(t => t.onTurnStart?.(battler));
    }


    /** ターン終了処理（Traitによる毎ターン効果） */
    static onTurnEnd(battler: Battler) {
        battler.traits.forEach(t => t.onTurnEnd?.(battler));
    }

    /**
     * 行動前処理
     * Traitにより行動を変更可能
     */
    static beforeAction(actor: Battler, action: BattleAction): BattleAction {
        return actor.traits.reduce((ctx, trait) => {
            if (!trait.onBeforeAction) return ctx;
            return trait.onBeforeAction(ctx) ?? ctx;
        }, action);
    }
}
