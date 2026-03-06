// src/shared/master/battle/type/BuffPreset.ts

import { BuffCategory } from "../../../type/battle/status/BuffCategory";
import { StackRule } from "../../../type/battle/status/StackRule";

export type BuffPreset = {
    id: string;
    category: BuffCategory,
    name: string;
    stackRule: StackRule;
    apply: (base: number, value: number) => number;
};

export const BuffPresetId = {
    ATK: "ATK", DEF: "DEF", INT: "INT", SPD: "SPD", AGGRO: "AGGRO",
} as const;
export type BuffPresetId = typeof BuffPresetId[keyof typeof BuffPresetId]

export const BuffPresetName = {
    ATK: "攻撃力", DEF: "防御力", INT: "賢さ", SPD: "素早さ", AGGRO: "狙われやすさ",
} as const;
export type BuffPresetName = typeof BuffPresetName[keyof typeof BuffPresetName]
