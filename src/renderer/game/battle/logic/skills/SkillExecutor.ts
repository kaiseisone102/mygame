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
            actor.mp = Math.max(0, actor.mp - cost);
        }

        for (const target of targets) {
            if (!target.alive) continue;

            for (const effect of skill.effects) {
                if (!target.alive) continue; // 途中死亡対策

                switch (effect.type) {
                    case SkillEffectKindId.DAMAGE: {
                        const base = calcDamage(actor, target, effect);
                        const final = TraitRunner.applyDamageTraits(
                            { source: actor, target, skill, damage: base },
                            target.traits
                        );

                        target.hp = Math.max(0, target.hp - final);
                        const killed = target.hp === 0;
                  
                        results.push({
                            kind: SkillEffectKindId.DAMAGE,
                            sourceId: actor.id,
                            targetId: target.id,
                            value: final,
                            isCritical: false, // calcDamageで返してもいい
                            killed
                        });
                        break;
                    }

                    case SkillEffectKindId.HEAL: {
                        const base = effect.power;
                        const final = TraitRunner.applyHealTraits(
                            { source: actor, target, skill, heal: base },
                            target.traits
                        );

                        target.hp = Math.min(target.maxHp, target.hp + final);

                        results.push({
                            kind: SkillEffectKindId.HEAL,
                            sourceId: actor.id,
                            targetId: target.id,
                            value: final
                        });
                        break;
                    }

                    case SkillEffectKindId.STATUS:
                        if (Math.random() < effect.chance) {
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