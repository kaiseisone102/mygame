// src/renderer/game/battle/logic/skills/SkillExecutor.ts

import { StatusCategory, StatusId, StatusPresets } from "../../../../../shared/master/battle/StatusPreset";
import { getBuffPowerValue } from "../../../../../shared/master/battle/SkillRepository";
import { SkillPreset } from "../../../../../shared/master/battle/type/SkillPreset";
import { BattleEvent } from "../../../../../shared/type/battle/event/BattleEvent";
import { SkillResult } from "../../../../../shared/type/battle/result/SkillResult";
import { SkillEffectKindId } from "../../../../../shared/type/battle/skill/skillFormula";
import { Battler } from "../../core/Battler";
import { calcDamage } from "../calculator/calcDamage";
import { createStatus } from "../status/createStatus";
import { TraitRunner } from "../traits/TraitRunner";

export class SkillExecutor {
    static execute(actor: Battler, skill: SkillPreset, targets: Battler[]): SkillResult[] {
        const results: SkillResult[] = [];
        const mpCost = skill.cost?.mp;

        // MP消費(メソッドがあればそれを使うのが理想ですが、現状は直接代入でも可)
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
                        actor.emitEvent(BattleEvent.ATTACK, {
                            source: actor,
                            target
                        });

                        const base = calcDamage(actor, target, effect);
                        const final = TraitRunner.applyDamageTraits(
                            { source: actor, target, skill, damage: base.damage },
                            target.traits
                        );

                        // メソッドを使用し、HP減少を適用
                        target.addHp(-final);
                        const killed = !target.alive;

                        target.emitEvent(BattleEvent.DAMAGE, {
                            source: actor,
                            target,
                            value: final
                        });

                        results.push({
                            kind: SkillEffectKindId.DAMAGE,
                            instanceId: actor.instanceId,
                            targetId: target.instanceId,
                            value: final,
                            isCritical: base.isCritical,
                            killed: killed,
                            success: true // ダメージが発生したなら成功
                        });
                        break;
                    }

                    case SkillEffectKindId.HEAL: {
                        const base = effect.power;
                        const final = TraitRunner.applyHealTraits(
                            { source: actor, target, skill, heal: base },
                            [...actor.traits, ...target.traits]
                        );

                        target.addHp(final);

                        results.push({
                            kind: SkillEffectKindId.HEAL,
                            instanceId: actor.instanceId,
                            targetId: target.instanceId,
                            value: final,
                            success: true
                        });
                        break;
                    }

                    case SkillEffectKindId.STATUS:
                        const chance = effect.chance ?? 1;
                        if (Math.random() >= chance) {
                            results.push({
                                kind: SkillEffectKindId.STATUS,
                                instanceId: actor.actorMasterId,
                                statusId: skill.id,
                                targetId: target.instanceId,
                                success: false
                            });
                            break;
                        }

                        if (!effect.statusId) break;

                        const preset = StatusPresets[effect.statusId as StatusId];
                        const attribute = preset.category === StatusCategory.ATTACK || StatusCategory.DEFENSE || StatusCategory.MAGIC || StatusCategory.SPEED || StatusCategory.AGGRO ? preset.category : undefined; // "attack", "defense" 等のステータスキー

                        // --- 1. バフ・デバフ（数値変化）がある場合の前後値記録 ---
                        const buffValue = getBuffPowerValue(effect.value);
                        let beforeValue = 0;
                        let afterValue = 0;
                        const isBuffDebuff = attribute && attribute in target.baseStats;

                        if (isBuffDebuff) {
                            // target.attack などの getter を通じて現在の最終値を取得
                            beforeValue = (target as any)[attribute];
                        }

                        const instance = createStatus(effect.statusId as StatusId, actor, buffValue);
                    
                        target.addStatus(instance);

                        // --- 3. 付与後の反映 ---
                        if (isBuffDebuff) {
                            afterValue = (target as any)[attribute];
                        }

                        results.push({
                            kind: SkillEffectKindId.STATUS,
                            instanceId: actor.instanceId,
                            targetId: target.instanceId,
                            statusId: effect.statusId,
                            // バフ系なら差分を、状態異常なら 0 や duration を入れる
                            value: isBuffDebuff ? instance.value : (buffValue ?? 0),
                            preValue: isBuffDebuff ? beforeValue : undefined,
                            postValue: isBuffDebuff ? afterValue : undefined,
                            attribute: attribute,
                            success: true
                        });
                        break;

                    case SkillEffectKindId.ESCAPE:

                        const success = Math.random() < (effect.chance ?? 0.7);

                        results.push({
                            kind: SkillEffectKindId.ESCAPE,
                            instanceId: actor.instanceId,
                            targetId: actor.instanceId,
                            success
                        });

                        break;
                }
            }
        }
        return results;
    }
}