// src/shared/battle/status/logic/confusionLogic.ts

import { TechniqueId } from "../../../../master/battle/type/SkillPreset";
import { BattleAction, StrangeAction } from "../../BattleAction";
import { ActionRewriteContext } from "../context/ActionRewriteContext";
import { StatusContext } from "../context/statusContext";

// 🤪 confusionLogic
export function confusionLogic(params: { failRate: number; recoverRate: number; }) {
    return {
        /**
         * 行動の書き換え
         * params.failRate の確率で、ターゲットを味方に変えて通常攻撃させる
         */
        onRewriteAction: (action: BattleAction, ctx: ActionRewriteContext): StrangeAction | undefined => {
            if (Math.random() >= params.failRate) {
                // 通常どうり行動
                return undefined;
            }

            // 味方からランダムにターゲットを選択（自傷含む）
            const candidates = ctx.allies;
            const target = candidates[Math.floor(Math.random() * candidates.length)];

            console.log(`${ctx.self.name} は混乱している！`);

            return {
                ...action, // 基本プロパティ（actorInstanceIdなど）をすべて継承
                skillId: TechniqueId.ATTACK, // 通常攻撃に固定
                targetInstanceIds: [target.instanceId], // ターゲットを味方に書き換え
            };
        },

        onBeforeAction: (ctx: StatusContext) => {
            // 30%の確率で行動不可（falseを返すと行動失敗）
            return Math.random() >= 0.3;
        },

        onExpire: (ctx: StatusContext) => {
            // target(IBattler) の名前やHPを参照できる
            console.log(`${ctx.target.name} の ${ctx.preset.name} が治った`);
        },

        /**
         * 解除判定
         */
        shouldExpire: (): boolean => {
            return Math.random() < params.recoverRate;
        }
    };
}