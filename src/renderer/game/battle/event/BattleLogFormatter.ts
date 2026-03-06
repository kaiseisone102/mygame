// src/renderer/game/battle/event/BattleLogFormatter.ts

import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { SkillEffectKindId } from "../../../../shared/type/battle/skill/skillFormula";
import { Battler } from "../core/Battler";

export class BattleLogFormatter {

    static fromResult(
        result: SkillResult,
        source: Battler,
        target: Battler
    ): string[] {

        const logs: string[] = [];

        switch (result.kind) {

            case SkillEffectKindId.DAMAGE:
                logs.push(
                    `${target.name}に${result.value}のダメージ！`
                );

                if (result.killed) {
                    logs.push(
                        `${target.name}は倒れた！`
                    );
                }
                break;

            case SkillEffectKindId.HEAL:
                logs.push(
                    `${target.name}のHPが${result.value}回復した！`
                );
                break;

            case SkillEffectKindId.STATUS:
                logs.push(
                    `${target.name}は${result.statusId}状態になった！`
                );
                break;

            case SkillEffectKindId.BUFF:
                logs.push(
                    `${target.name}の${result.buffId}が上がった！`
                );
                break;
        }

        return logs;
    }
}