// src/shared/master/battle/BuffPresets.ts

import { StackRuleId } from "../../type/battle/status/StackRule";
import { BuffPreset, BuffPresetId, BuffPresetName } from "./type/BuffPreset ";

export const BuffPresets: Record<string, BuffPreset> = {
    ATK: {
        id: BuffPresetId.ATK,
        category: BuffPresetId.ATK,
        name: BuffPresetName.ATK,
        stackRule: StackRuleId.EXTEND,
        apply: (base: number, value: number) => base * (1 + value),
    },

    DEF: {
        id: BuffPresetId.DEF,
        category: BuffPresetId.DEF,
        name: BuffPresetName.DEF,
        stackRule: StackRuleId.EXTEND,
        apply: (base: number, value: number) => base * (1 + value),
    },

    INT: {
        id: BuffPresetId.INT,
        category: BuffPresetId.INT,
        name: BuffPresetName.INT,
        stackRule: StackRuleId.EXTEND,
        apply: (base: number, value: number) => base * (1 + value),
    },

    SPD: {
        id: BuffPresetId.SPD,
        category: BuffPresetId.SPD,
        name: BuffPresetName.SPD,
        stackRule: StackRuleId.EXTEND,
        apply: (base: number, value: number) => base * (1 + value),
    },

    AGGRO: {
        id: BuffPresetId.AGGRO,
        category: BuffPresetId.AGGRO,
        name: BuffPresetName.AGGRO,
        stackRule: StackRuleId.REPLACE,
        apply: (_: number, value: number) => value,  // _ は使わないよ
    },
} as const;

// export const StackRule = {
//     STACK: "STACK",
//     REPLACE: "REPLACE",
//     EXTEND: "EXTEND",
//     IGNORE: "IGNORE",
// } as const;
