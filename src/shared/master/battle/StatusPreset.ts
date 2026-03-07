// src/shared/master/battle/StatusPresets.ts

import { confusionLogic } from "../../type/battle/status/logic/confusionLogic";
import { sleepLogic } from "../../type/battle/status/logic/sleepLogic";
import { StackRule } from "../../type/battle/status/StackRule";
import { StatusEffect, StatusId } from "../../type/battle/status/StatusEffect";
import { poisonLogic } from "../../type/battle/status/logic/poisonLogic";
import { StatusCategory } from "../../type/battle/status/StatusCategory";
import { StatusContext } from "../../type/battle/status/context/statusContext";

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
}

export type StatusPreset = {
    id: StatusId
    category: StatusCategory

    order: number
    priority: number
    duration: number
    stackRule: StackRule
} & StatusLogic;

export const StatusPresets: Record<StatusId, StatusPreset> = {

    CONFUSION: {
        id: StatusId.CONFUSION,
        category: StatusCategory.CONFUSION,
        order: 30,
        priority: 15,
        duration: -1,
        stackRule: StackRule.REPLACE,
        ...confusionLogic({
            failRate: 0.3,
            recoverRate: 0.2,
        }),
    },

    CHARM: {
        id: StatusId.CHARM,
        category: StatusCategory.CONFUSION,
        order: 30,
        priority: 30,
        duration: -1,
        stackRule: StackRule.REPLACE,
        ...confusionLogic({
            failRate: 0.8,
            recoverRate: 0.4,
        }),
    },

    PARALYSIS: {
        id: StatusId.PARALYSIS,
        category: StatusCategory.PARALYSIS,
        order: 20,
        priority: 15,
        duration: -1,
        stackRule: StackRule.IGNORE,
        onBeforeAction: () => Math.random() >= 0.5,
        shouldExpire: () => Math.random() < 0.2,
    },

    SLEEP: {
        id: StatusId.SLEEP,
        category: StatusCategory.SLEEP,
        order: 20,
        priority: 10,
        duration: -1,
        stackRule: StackRule.REPLACE,
        ...sleepLogic(0.4),
    },

    STRONG_SLEEP: {
        id: StatusId.STRONG_SLEEP,
        category: StatusCategory.SLEEP,
        order: 20,
        priority: 20,
        duration: -1,
        stackRule: StackRule.REPLACE,
        ...sleepLogic(0.2),
    },

    POISON: {
        id: StatusId.POISON,
        category: StatusCategory.POISON,
        order: 5,
        priority: 20,
        duration: 3,
        stackRule: StackRule.EXTEND,
        ...poisonLogic(0.05),
    },

    STRONG_POISON: {
        id: StatusId.STRONG_POISON,
        category: StatusCategory.POISON,
        order: 5,
        priority: 40,
        duration: 5,
        stackRule: StackRule.EXTEND,
        ...poisonLogic(0.1),
    },
};