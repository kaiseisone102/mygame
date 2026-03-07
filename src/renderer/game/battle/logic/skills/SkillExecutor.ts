// src/renderer/game/battle/logic/skills/SkillExecutor.ts

import { TraitRunner } from "../traits/TraitRunner";
import { Battler } from "../../core/Battler";
import { calcDamage } from "../calculator/calcDamage";
import { createStatus } from "../status/createStatus";
import { createBuff } from "../status/createBuff";
import { SkillResult } from "../../../../../shared/type/battle/result/SkillResult";
import { SkillEffectKindId } from "../../../../../shared/type/battle/skill/skillFormula";
import { SkillPreset } from "../../../../../shared/master/battle/type/SkillPreset";

export class SkillExecutor {
    static execute(actor: Battler, skill: SkillPreset, targets: Battler[]): SkillResult[] {
        const results: SkillResult[] = [];
        const mpCost = skill.cost?.mp;

        // MP消費
        if (mpCost != null) {
            const cost = TraitRunner.applyMpCost(mpCost, skill, actor.traits);
            actor.baseStats.mp = Math.max(0, actor.baseStats.mp - cost);
        }

        for (const target of targets) {
            if (!target.alive) continue;

            for (const effect of skill.effects) {
                if (!target.alive) continue; // 途中死亡対策

                switch (effect.type) {
                    case SkillEffectKindId.DAMAGE: {
                        const base = calcDamage(actor, target, effect);
                        const final = TraitRunner.applyDamageTraits(
                            { source: actor, target, skill, damage: base.damage },
                            [...actor.traits, ...target.traits]
                        );

                        target.baseStats.hp = Math.max(0, target.addHp(-final));
                        const killed = !target.alive;

                        results.push({
                            kind: SkillEffectKindId.DAMAGE,
                            sourceId: actor.id,
                            targetId: target.id,
                            value: final,
                            isCritical: base.isCritical, // calcDamageで返してもいい
                            killed
                        });
                        break;
                    }

                    case SkillEffectKindId.HEAL: {
                        const base = effect.power;
                        const final = TraitRunner.applyHealTraits(
                            { source: actor, target, skill, heal: base },
                            [...actor.traits, ...target.traits]
                        );

                        target.baseStats.hp = Math.min(target.baseStats.maxHp, target.baseStats.hp + final);

                        results.push({
                            kind: SkillEffectKindId.HEAL,
                            sourceId: actor.id,
                            targetId: target.id,
                            value: final
                        });
                        break;
                    }

                    case SkillEffectKindId.STATUS:

                        const chance = effect.chance ?? 1;

                        if (Math.random() < chance) {
                            target.addStatus(createStatus(effect.statusId, { source: actor, skill }))

                            results.push({
                                kind: SkillEffectKindId.STATUS,
                                sourceId: actor.id,
                                targetId: target.id,
                                statusId: effect.statusId
                            });
                        }
                        break;

                    case SkillEffectKindId.BUFF:
                        target.addBuff(
                            createBuff(effect.buffId, { value: effect.value, turns: effect.turns })
                        );

                        results.push({
                            kind: SkillEffectKindId.BUFF,
                            sourceId: actor.id,
                            targetId: target.id,
                            buffId: effect.buffId
                        });
                        break;

                    case "SPECIAL":// SPECIAL: 最低限のユニーク処理用（基本は使わない）
                        effect.handler(actor, target);
                        break;
                }
            }
        }
        return results;
    }
}