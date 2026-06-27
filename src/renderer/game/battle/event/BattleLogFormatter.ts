// src/renderer/game/battle/event/BattleLogFormatter.ts

import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { StatusId, StatusPresets } from "../../../../shared/master/battle/StatusPreset";
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

            case SkillEffectKindId.STATUS: {
                const statusName = StatusPresets[result.statusId as StatusId]?.name ?? result.statusId;

                if (result.success === false) {
                    // 抵抗された/外した
                    logs.push(`${target.name}には効かなかった！`);
                } else if (result.removed) {
                    // 解除時のログ
                    logs.push(`${target.name}の${statusName}が治った！`);
                } else if (!result.value) {
                    // 状態異常付与(睡眠・毒など)
                    logs.push(`${instanceId.name}は${target.name}を${statusName}状態にした！`);
                } else {
                    // バフ・デバフ: 正なら上げる、負なら下げる
                    const pct = Math.round(Math.abs(result.value) * 100);
                    const verb = result.value < 0 ? "下げた" : "上げた";
                    logs.push(`${instanceId.name}は${target.name}の${statusName}を${pct}%${verb}！(${result.preValue} → ${result.postValue})`);
                }
                break;
            }

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