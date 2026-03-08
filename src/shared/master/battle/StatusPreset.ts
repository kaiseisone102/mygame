// src/shared/master/battle/StatusPresets.ts

import { confusionLogic } from "../../type/battle/status/logic/confusionLogic";
import { sleepLogic } from "../../type/battle/status/logic/sleepLogic";
import { StackRule } from "../../type/battle/status/StackRule";
import { StatusId } from "../../type/battle/status/StatusEffect";
import { poisonLogic } from "../../type/battle/status/logic/poisonLogic";
import { StatusCategory } from "../../type/battle/status/StatusCategory";
import { StatusContext } from "../../type/battle/status/context/statusContext";
import { BattleEvent } from "../../type/battle/event/BattleEvent";
import { EventContext } from "../../type/battle/event/EventContext";
import { drainLogic } from "../../type/battle/status/logic/drainLogic";
import { BaseStats, Battler } from "../../../renderer/game/battle/core/Battler";
import { LARGE_PRIORITY, MID_PRIORITY, ORDER_ACTION_LOCK, ORDER_CONTROL, ORDER_DAMAGE, StatusTickType, VERY_LARGE_PRIORITY } from "../../type/battle/status/constants/statusConstant";

export type StatusLogic = {
    /** 行動前判定。falseなら行動不可 */
    onBeforeAction?: (ctx: StatusContext) => boolean;
    /** ターン開始時の処理 */
    onTurnStart?: (ctx: StatusContext) => void;
    /** 適用時の処理 */
    onApply?: (ctx: StatusContext) => void;
    /** ターン開始時に解除されるか判定 */
    shouldExpire?: () => boolean;
    /** 効果解除時 */
    onExpire?: (ctx: StatusContext) => void;

    onEvent?: (event: BattleEvent, ctx: EventContext) => void;

    statModifier?: (stat: keyof BaseStats, value: number) => number;

    onTurnTick?: (target: Battler) => void;
}

export type StatusPreset = {
    id: StatusId;
    category: StatusCategory;

    order: number;
    priority?: number;
    duration?: number;
    stackRule: StackRule;
    blocksAction?: boolean; // 行動不能か
    tickType?: StatusTickType
} & StatusLogic;

export const StatusPresets: Record<StatusId, StatusPreset> = {

    CONFUSION: {
        id: StatusId.CONFUSION,
        category: StatusCategory.ACTION_LOCK,
        order: ORDER_ACTION_LOCK,
        priority: MID_PRIORITY,
        duration: -1,
        stackRule: StackRule.REPLACE,
        ...confusionLogic({
            failRate: 0.3,
            recoverRate: 0.2,
        }),
    },

    CHARM: {
        id: StatusId.CHARM,
        category: StatusCategory.ACTION_LOCK,
        order: ORDER_ACTION_LOCK,
        priority: LARGE_PRIORITY,
        duration: -1,
        stackRule: StackRule.REPLACE,
        ...confusionLogic({
            failRate: 0.8,
            recoverRate: 0.4,
        }),
    },

    PARALYSIS: {
        id: StatusId.PARALYSIS,
        category: StatusCategory.ACTION_LOCK,
        order: ORDER_ACTION_LOCK,
        priority: MID_PRIORITY,
        duration: -1,
        stackRule: StackRule.IGNORE,
        onBeforeAction: () => Math.random() >= 0.5,
        shouldExpire: () => Math.random() < 0.2,
    },

    SLEEP: {
        id: StatusId.SLEEP,
        category: StatusCategory.ACTION_LOCK,
        order: ORDER_ACTION_LOCK,
        priority: MID_PRIORITY,
        duration: -1,
        stackRule: StackRule.REPLACE,
        ...sleepLogic(0.4),
        blocksAction: true
    },

    STRONG_SLEEP: {
        id: StatusId.STRONG_SLEEP,
        category: StatusCategory.ACTION_LOCK,
        order: ORDER_ACTION_LOCK,
        priority: LARGE_PRIORITY,
        duration: -1,
        stackRule: StackRule.REPLACE,
        ...sleepLogic(0.2),
    },

    POISON: {
        id: StatusId.POISON,
        category: StatusCategory.POISON,
        order: ORDER_DAMAGE,
        priority: MID_PRIORITY,
        duration: 3,
        stackRule: StackRule.EXTEND,
        tickType: StatusTickType.TURN_END,
        ...poisonLogic(0.05)
    },

    STRONG_POISON: {
        id: StatusId.STRONG_POISON,
        category: StatusCategory.POISON,
        order: ORDER_DAMAGE,
        priority: LARGE_PRIORITY,
        duration: 5,
        stackRule: StackRule.EXTEND,
        tickType: StatusTickType.TURN_END,
        ...poisonLogic(0.1),
    },

    FREEZE: {
        id: StatusId.FREEZE,
        category: StatusCategory.ACTION_LOCK,
        order: ORDER_ACTION_LOCK,
        priority: LARGE_PRIORITY,
        duration: 3,
        stackRule: StackRule.IGNORE,
        blocksAction: true,
        statModifier(stat, value) {

            if (stat === "speed") {
                return 0;
            }

            return value;
        },
        onEvent(event, ctx) {

            if (event === BattleEvent.DAMAGE) {
                // ctx.removeSelf();
            }

        },
        onApply(target) {
            // 任意: エフェクトなど
        },

        onExpire(target) {
            // 任意: 解除演出
        }
    },

    DRAIN: {
        id: StatusId.DRAIN,
        category: StatusCategory.SPECIAL,
        order: 0,
        priority: 0,
        duration: -1,
        stackRule: StackRule.REPLACE,

        ...drainLogic(0.2)
    },


    STUN: {
        id: StatusId.STUN,
        category: StatusCategory.ACTION_LOCK,
        order: ORDER_ACTION_LOCK,
        priority: MID_PRIORITY,
        duration: -1,
        stackRule: StackRule.IGNORE,
        blocksAction: true,
    },

    REGEN: {
        id: StatusId.REGEN,
        category: StatusCategory.REGEN,
        order: ORDER_CONTROL,
        duration: 5,
        stackRule: StackRule.EXTEND,
        tickType: StatusTickType.TURN_END,

        onTurnTick(battler) {
            const heal = Math.floor(battler.baseStats.maxHp * 0.05);
            battler.addHp(heal);
        }
    },

    DEAD: {
        id: StatusId.DEAD,
        category: StatusCategory.SPECIAL,
        order: 0,
        priority: VERY_LARGE_PRIORITY,
        duration: -1,
        stackRule: StackRule.IGNORE,
    }
};