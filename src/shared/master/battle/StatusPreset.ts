// src/shared/master/battle/StatusPresets.ts

import { confusionLogic } from "../../type/battle/status/logic/confusionLogic";
import { sleepLogic } from "../../type/battle/status/logic/sleepLogic";
import { StackRuleId } from "../../type/battle/status/StackRule";
import { StatusEffect } from "../../type/battle/status/StatusEffect";
import { poisonLogic } from "../../type/battle/status/logic/poisonLogic";
import { StatusCategory } from "../../type/battle/status/StatusCategory";

export type StatusPreset =
    Omit<StatusEffect, "priority" | "duration" | "stackRule"> &
    Partial<Pick<StatusEffect, "priority" | "duration" | "stackRule">>;
    
export const StatusPresets = {
    CONFUSION: {
        id: "CONFUSION",
        category: StatusCategory.CONFUSION,
        priority: 15,
        duration: -1,
        stackRule: StackRuleId.REPLACE,
        ...confusionLogic({
            failRate: 0.3,
            recoverRate: 0.2,
        }),
    },

    CHARM: {
        id: "CHARM",
        category: StatusCategory.CONFUSION,
        priority: 30,
        duration: -1,
        stackRule: StackRuleId.REPLACE,
        ...confusionLogic({
            failRate: 0.8,
            recoverRate: 0.4,
        }),
    },

    PARALYSIS: {
        id: "PARALYSIS",
        category: StatusCategory.PARALYSIS,
        priority: 15,
        duration: -1,
        stackRule: StackRuleId.IGNORE,
        onBeforeAction: () => Math.random() >= 0.5,
        shouldExpire: () => Math.random() < 0.2,
    },

    SLEEP: {
        id: "SLEEP",
        category: StatusCategory.SLEEP,
        priority: 10,
        duration: -1,
        stackRule: StackRuleId.REPLACE,
        ...sleepLogic(0.4),
    },

    STRONG_SLEEP: {
        id: "STRONG_SLEEP",
        category: StatusCategory.SLEEP,
        priority: 20,
        duration: -1,
        stackRule: StackRuleId.REPLACE,
        ...sleepLogic(0.2),
    },

    POISON: {
        id: "POISON",
        category: StatusCategory.POISON,
        duration: 3,
        stackRule: StackRuleId.EXTEND,
        ...poisonLogic(0.05),
    },

    STRONG_POISON: {
        id: "STRONG_POISON",
        category: StatusCategory.POISON,
        duration: 5,
        stackRule: StackRuleId.EXTEND,
        ...poisonLogic(0.1),
    },

} satisfies Record<string, StatusPreset>;
