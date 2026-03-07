// src/shared/type/battle/status/StackRule.ts

export const StackRule = {
    STACK: "STACK",
    REPLACE: "REPLACE",
    EXTEND: "EXTEND",
    IGNORE: "IGNORE",
} as const;
export type StackRule = typeof StackRule[keyof typeof StackRule];

// export type StackRule = "STACK" | "REPLACE" | "EXTEND" | "IGNORE";  // 同種バフの扱い