// src/renderer/game/battle/event/convertSkillResult.ts

import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { SkillEffectKindId } from "../../../../shared/type/battle/skill/skillFormula";
import { BattleEvent, BattleEventKind } from "./BattleEvent";

export function convertSkillResultToBattleEvents(results: SkillResult[]): BattleEvent[] {
    const finalEvents: BattleEvent[] = [];

    // 1. 種類ごとに結果をグルーピングする
    const damageResults = results.filter(r => r.kind === SkillEffectKindId.DAMAGE);
    const healResults = results.filter(r => r.kind === SkillEffectKindId.HEAL);
    const statusResults = results.filter(r => r.kind === SkillEffectKindId.STATUS);
    const otherResults = results.filter(r =>
        r.kind !== SkillEffectKindId.DAMAGE &&
        r.kind !== SkillEffectKindId.HEAL &&
        r.kind !== SkillEffectKindId.STATUS
    );

    // --- A. ダメージの一斉処理 ---
    if (damageResults.length > 0) {
        const dmgEvents: BattleEvent[] = damageResults.map(result => ({
            type: BattleEventKind.DAMAGE,
            instanceId: result.instanceId,
            targetId: result.targetId,
            value: result.value,
            options: {
                isCritical: result.options.isCritical ?? false,
                isWeakness: result.options.isWeakness ?? false,
                isResist: result.options.isResist ?? false,
                sizeMultiplier: result.options.sizeMultiplier ?? 1
            },
            killed: result.killed ?? false,
        }));

        // まとめてBULKに突っ込む
        finalEvents.push({
            type: BattleEventKind.BULK,
            events: dmgEvents
        });

        // 死亡判定も一斉に行う（ダメージ演出の後に全員一斉に消える）
        const deadEvents: BattleEvent[] = damageResults
            .filter(r => r.killed)
            .map(r => ({ type: BattleEventKind.DEAD, targetId: r.targetId }));

        if (deadEvents.length > 0) {
            finalEvents.push({
                type: BattleEventKind.BULK,
                events: deadEvents
            });
        }
    };

    // --- B. 回復の一斉処理 ---
    if (healResults.length > 0) {
        finalEvents.push({
            type: BattleEventKind.BULK,
            events: healResults.map(r => ({
                type: BattleEventKind.HEAL,
                instanceId: r.instanceId,
                targetId: r.targetId,
                value: r.value,
            }))
        });
    }

    // --- C. 状態異常の一斉処理 ---
    if (statusResults.length > 0) {
        finalEvents.push({
            type: BattleEventKind.BULK,
            events: statusResults.map(r => ({
                type: BattleEventKind.STATUS_APPLIED,
                instanceId: r.instanceId,
                targetId: r.targetId,
                statusId: r.statusId,
            }))
        });
    }

    // --- D. その他（逃走など、単発で処理すべきもの） ---
    for (const result of otherResults) {
        if (result.kind === SkillEffectKindId.ESCAPE) {
            finalEvents.push({ type: BattleEventKind.ESCAPE, instanceId: result.instanceId });
            finalEvents.push({ type: BattleEventKind.DELAY, duration: 800 });
        }
    }

    return finalEvents;
}
