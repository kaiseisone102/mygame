// src/renderer/game/battle/logic/traits/TraitRunner.ts

import { Battler } from "../../core/Battler";
import { BattleAction } from "../../../../../shared/type/battle/BattleAction";
import { Trait } from "../../../../../shared/type/battle/trait/Trait";
import { DamageContext } from "../../../../../shared/type/battle/trait/TraitType";
import { SkillPreset } from "../../../../../shared/master/battle/type/SkillPreset";

export interface DamageResult {
    damage: number;
    isWeakness: boolean;
    isResist: boolean; // 耐性も取れるようにしておくと便利
}

export class TraitRunner {
    static applyDamageTraits(ctx: DamageContext, targetTraits: Trait[]): DamageResult {
        const initialDamage = ctx.damage;

        const finalDamage = targetTraits.reduce((currentDamage, trait) => {
            if (!trait.onDamage) return currentDamage;
            // 現在のダメージを引き継ぎつつ計算
            return trait.onDamage({ ...ctx, damage: currentDamage });
        }, initialDamage);

        return {
            damage: finalDamage,
            // 元のダメージより増えていれば「弱点」とみなす
            isWeakness: finalDamage > initialDamage,
            // 元のダメージより減っていれば「耐性」とみなす
            isResist: finalDamage < initialDamage
        };
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
