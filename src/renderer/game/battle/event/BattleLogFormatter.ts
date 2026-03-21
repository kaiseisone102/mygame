// src/renderer/game/battle/event/BattleLogFormatter.ts

import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { SkillEffectKindId } from "../../../../shared/type/battle/skill/skillFormula";
import { Battler } from "../core/Battler";

export class BattleLogFormatter {

    fromResult(result: SkillResult, instanceId: Battler, target: Battler): string[] {

        const logs: string[] = [];

        switch (result.kind) {

            case SkillEffectKindId.DAMAGE:

                if (result.statusId) {
                    logs.push(`${target.name}は${result.statusId}のダメージを受けた！ (HP-${result.value})`);

                } else if (result.instanceId === target.instanceId) {
                    // statusId が取れない場合のフォールバック
                    logs.push(`${target.name}はダメージを受けた！ (HP-${result.value})`);

                } else {
                    logs.push(`${instanceId.name}が${target.name}に${result.value}のダメージ！`);
                }

                if (result.killed) {
                    logs.push(`${target.name}は倒れた！`);
                }
                break;

            case SkillEffectKindId.HEAL:
                if (result.statusId) {
                    // 継続回復（リジェネなど）の場合
                    logs.push(`${target.name}は${result.statusId}でHPが${result.value}回復した！`);
                } else
                    logs.push(`${instanceId.name}が${target.name}のHPを${result.value}回復！`);
                break;

            case SkillEffectKindId.STATUS:
                if (result.removed) {
                    // 解除時のログ（辞書を使って「混乱」などに変換しても良い）
                    const statusName = result.statusId;
                    logs.push(`${target.name}の${statusName}が治った！`);
                } else {
                    if (!result.value) {
                        logs.push(`${instanceId.name}が${target.name}を${result.statusId}状態にした！`);
                    } else {
                        logs.push(`${instanceId.name}が${target.name}の${result.statusId}を${(result.value * 100)}%上げた！(${result.preValue} -> ${result.postValue})`);
                    }
                }
                break;

            case SkillEffectKindId.ESCAPE:

                if (result.success) {
                    logs.push(`${instanceId.name}は逃げ出した！`);
                } else {
                    logs.push(`${instanceId.name}は逃げられなかった！`);
                }

                break;
        }

        return logs;
    }
}