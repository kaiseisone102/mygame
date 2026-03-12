// src/renderer/game/battle/event/convertSkillResult.ts

import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { SkillEffectKindId } from "../../../../shared/type/battle/skill/skillFormula";
import { BattleEvent, BattleEventKind } from "./BattleEvent";

export function convertSkillResultToBattleEvents(results: SkillResult[]): BattleEvent[] {
    const events: BattleEvent[] = [];

    for (const result of results) {
        switch (result.kind) {
            case SkillEffectKindId.DAMAGE:
                events.push({
                    type: BattleEventKind.DAMAGE,
                    instanceId: result.instanceId,
                    targetId: result.targetId,
                    value: result.value,
                    isCritical: result.isCritical ?? false,
                    killed: result.killed ?? false,
                });

                if (result.killed) {
                    events.push({
                        type: BattleEventKind.DEAD,
                        targetId: result.targetId
                    });
                }
                break;

            case SkillEffectKindId.HEAL:
                events.push({
                    type: BattleEventKind.HEAL,
                    instanceId: result.instanceId,
                    targetId: result.targetId,
                    value: result.value,
                });
                break;

            case SkillEffectKindId.STATUS:
                events.push({
                    type: BattleEventKind.STATUS_APPLIED,
                    instanceId: result.instanceId,
                    targetId: result.targetId,
                    statusId: result.statusId,
                });
                break;

            case SkillEffectKindId.BUFF:
                events.push({
                    type: BattleEventKind.BUFF_APPLIED,
                    instanceId: result.instanceId,
                    targetId: result.targetId,
                    buffId: result.buffId,
                });
                break;

            case SkillEffectKindId.ESCAPE:
                events.push({
                    type: BattleEventKind.ESCAPE,
                    instanceId: result.instanceId
                });
                events.push({
                    type: BattleEventKind.DELAY, // you can choose duration of delay 
                    duration: 800
                });
                break
        }
    }

    return events;
}
