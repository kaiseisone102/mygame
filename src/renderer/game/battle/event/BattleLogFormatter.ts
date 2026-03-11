// src/renderer/game/battle/event/BattleLogFormatter.ts

import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { SkillEffectKindId } from "../../../../shared/type/battle/skill/skillFormula";
import { Battler } from "../core/Battler";

export class BattleLogFormatter {

    static fromResult(result: SkillResult, source: Battler, target: Battler): string[] {

        const logs: string[] = [];

        switch (result.kind) {

            case SkillEffectKindId.DAMAGE:
                logs.push(`${source.name}が${target.name}に${result.value}のダメージ！`);

                if (result.killed) {
                    logs.push(`${target.name}は倒れた！`);
                }
                break;

            case SkillEffectKindId.HEAL:
                logs.push(`${source.name}が${target.name}のHPを${result.value}回復！`);
                break;

            case SkillEffectKindId.STATUS:
                logs.push(`${source.name}が${target.name}を${result.statusId}状態にした！`);
                break;

            case SkillEffectKindId.BUFF:
                logs.push(`${source.name}が${target.name}の${result.buffId}が上げた！`);
                break;
        }

        return logs;
    }
}