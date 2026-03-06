// src/shared/type/battle/status/StackRule.ts

export const StackRuleId = {
    STACK: "STACK",
    REPLACE: "REPLACE",
    EXTEND: "EXTEND",
    IGNORE: "IGNORE",
} as const;

export type StackRule = typeof StackRuleId[keyof typeof StackRuleId];

// export type StackRule = "STACK" | "REPLACE" | "EXTEND" | "IGNORE";  // 同種バフの扱い