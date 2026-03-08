import { Battler } from "../../core/Battler";
import { SkillEffect } from "../../../../../shared/type/battle/skill/Skill";
import { MagicFormulaId, PhysicalFormulaId, SkillEffectKindId } from "../../../../../shared/type/battle/skill/skillFormula";
import { CalcDamageResult } from "../../../../../shared/type/battle/damage/DamageResult";

export function calcDamage(
    attacker: Battler,
    target: Battler,
    effect: Extract<SkillEffect, { type: typeof SkillEffectKindId.DAMAGE }>
): CalcDamageResult {

    switch (effect.formula) {
        case PhysicalFormulaId.ATK_DEF: {
            const atk = attacker.baseStats.attack;
            const def = target.baseStats.defense;
            return { damage: Math.max(1, atk - def), isCritical: false };
        }

        case PhysicalFormulaId.ATK_RATE: {
            const rate = effect.rate ?? 1;
            return { damage: Math.max(1, Math.floor(attacker.baseStats.attack * rate)), isCritical: false };
        }

        case PhysicalFormulaId.FIXED: {
            return { damage: Math.max(1, effect.power), isCritical: false };
        }

        case MagicFormulaId.MAGIC: {
            // 魔法攻撃 = 攻撃者の魔力 × rate + 固定魔法威力
            const baseMagic = attacker.baseStats.magic; // INT / 魔力ステータス
            const rate = effect.rate ?? 1;           // 割合が指定されていれば掛ける
            const power = effect.power ?? 0;         // 固定魔法威力
            const damage = Math.floor(baseMagic * rate + power);

            return {
                damage: Math.max(1, damage), isCritical: false
            };
        }

        default: return { damage: 0, isCritical: false };
    }
}
