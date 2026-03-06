import { Battler } from "../../core/Battler";
import { SkillEffect } from "../../../../../shared/type/battle/skill/Skill";
import { MagicFormulaId, PhysicalFormulaId, SkillEffectKindId } from "../../../../../shared/type/battle/skill/skillFormula";

export function calcDamage(
    attacker: Battler,
    target: Battler,
    effect: Extract<SkillEffect, { type: typeof SkillEffectKindId.DAMAGE }>
): number {

    switch (effect.formula) {
        case PhysicalFormulaId.ATK_DEF: {
            const atk = attacker.attack;
            const def = target.defense;
            return Math.max(1, atk - def);
        }

        case PhysicalFormulaId.ATK_RATE: {
            const rate = effect.rate ?? 1;
            return Math.max(1, Math.floor(attacker.attack * rate));
        }

        case PhysicalFormulaId.FIXED: {
            return Math.max(1, effect.power);
        }

        case MagicFormulaId.MAGIC: {
            // 魔法攻撃 = 攻撃者の魔力 × rate + 固定魔法威力
            const baseMagic = attacker.magic; // INT / 魔力ステータス
            const rate = effect.rate ?? 1;           // 割合が指定されていれば掛ける
            const power = effect.power ?? 0;         // 固定魔法威力
            const damage = Math.floor(baseMagic * rate + power);

            return Math.max(1, damage);
        }

        default:
            return 0;
    }
}
