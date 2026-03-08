// src/shared/master/battle/type/BuffPreset.ts

import { BuffCategory } from "../../../type/battle/status/BuffCategory";
import { StackRule } from "../../../type/battle/status/StackRule";

export type BuffPreset = {
    id: BuffId;
    category: BuffCategory,
    name: BuffName;
    stackRule: StackRule;
    apply: (base: number, value: number) => number;
};

export const BuffId = {
    ATK: "ATK", DEF: "DEF", INT: "INT", SPD: "SPD", AGGRO: "AGGRO",
} as const;
export type BuffId = typeof BuffId[keyof typeof BuffId]

export const BuffName = {
    ATK: "攻撃力", DEF: "防御力", INT: "賢さ", SPD: "素早さ", AGGRO: "狙われやすさ",
} as const;
export type BuffName = typeof BuffName[keyof typeof BuffName]
