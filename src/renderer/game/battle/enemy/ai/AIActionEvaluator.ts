// src/renderer/game/battle/enemy/ai/AIActionEvaluator.ts

import { Battler } from "../../core/Battler";
import { BattleState } from "../../core/BattleState";
import { SkillEffectKindId } from "../../../../../shared/type/battle/skill/skillFormula";
import { SkillPreset } from "shared/master/battle/type/SkillPreset";

export class AIActionEvaluator {

    static evaluateSkill(
        actor: Battler,
        skill: SkillPreset,
        targets: Battler[],
        state: BattleState
    ): number {
        let score = 0;

        for (const effect of skill.effects) {
            switch (effect.type) {

                case SkillEffectKindId.DAMAGE:
                    score += this.evaluateDamage(actor, targets, skill);
                    break;

                case SkillEffectKindId.HEAL:
                    score += this.evaluateHeal(targets, effect.power);
                    break;

                case SkillEffectKindId.STATUS:
                    score += this.evaluateStatus(targets, effect.chance);
                    break;

                case SkillEffectKindId.BUFF:
                    score += 10; // とりあえず固定
                    break;
            }
        }

        if (!skill.cost?.mp) throw new Error("AIActionEvaluator not found skill.cost.mp");

        // MPが足りないなら無効
        if (actor.baseStats.mp < skill.cost.mp) {
            return -Infinity;
        }

        return score;
    }

    private static evaluateDamage(
        actor: Battler,
        targets: Battler[],
        skill: SkillPreset
    ): number {
        let score = 0;

        for (const target of targets) {
            const hpRate = target.baseStats.hp / target.baseStats.maxHp;

            // 瀕死ほど評価高い
            score += (1 - hpRate) * 100;

            // 倒せそうなら超高評価
            if (target.baseStats.hp < actor.baseStats.attack * 2) {
                score += 200;
            }
        }

        // 全体攻撃ボーナス
        if (skill.effectScope === "GROUP" || skill.effectScope === "ALL") {
            score += targets.length * 20;
        }

        return score;
    }

    private static evaluateHeal(
        targets: Battler[],
        power: number
    ): number {
        let score = 0;

        for (const target of targets) {
            const missingHp = target.baseStats.maxHp - target.baseStats.hp;
            score += Math.min(missingHp, power);
        }

        return score;
    }

    private static evaluateStatus(
        targets: Battler[],
        chance: number
    ): number {
        // 状態異常は人数×確率
        return targets.length * chance * 50;
    }
}
