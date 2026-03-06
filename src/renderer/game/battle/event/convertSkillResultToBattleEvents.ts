// src/renderer/game/battle/event/convertSkillResult.ts

import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { SkillEffectKindId } from "../../../../shared/type/battle/skill/skillFormula";
import { BattleEvent, BattleEventKind } from "./BattleEvent";

export function convertSkillResultToBattleEvents(results: SkillResult[]): BattleEvent[] {
    const events: BattleEvent[] = [];

    for (const r of results) {
        switch (r.kind) {
            case SkillEffectKindId.DAMAGE:
                events.push({
                    type: BattleEventKind.DAMAGE,
                    sourceId: r.sourceId,
                    targetId: r.targetId,
                    value: r.value,
                    isCritical: r.isCritical ?? false,
                    killed: r.killed ?? false,
                });

                if (r.killed) {
                    events.push({
                        type: BattleEventKind.DEAD,
                        targetId: r.targetId
                    });
                }
                break;

            case SkillEffectKindId.HEAL:
                events.push({
                    type: BattleEventKind.HEAL,
                    sourceId: r.sourceId,
                    targetId: r.targetId,
                    value: r.value,
                });
                break;

            case SkillEffectKindId.STATUS:
                events.push({
                    type: BattleEventKind.STATUS_APPLIED,
                    sourceId: r.sourceId,
                    targetId: r.targetId,
                    statusId: r.statusId,
                });
                break;

            case SkillEffectKindId.BUFF:
                events.push({
                    type: BattleEventKind.BUFF_APPLIED,
                    sourceId: r.sourceId,
                    targetId: r.targetId,
                    buffId: r.buffId,
                });
                break;
        }
    }

    return events;
}
