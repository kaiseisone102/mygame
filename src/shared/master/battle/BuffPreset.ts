// src/shared/master/battle/BuffPresets.ts

import { BuffCategory } from "../../type/battle/status/BuffCategory";
import { StackRule } from "../../type/battle/status/StackRule";
import { BuffPreset, BuffId, BuffName } from "./type/BuffPreset ";

export const BuffPresets: Record<string, BuffPreset> = {
    ATK: {
        id: BuffId.ATK,
        category: BuffCategory.ATTACK,
        name: BuffName.ATK,
        stackRule: StackRule.EXTEND,
        apply: (base: number, value: number) => base * (1 + value),
    },

    DEF: {
        id: BuffId.DEF,
        category: BuffCategory.DEFENSE,
        name: BuffName.DEF,
        stackRule: StackRule.EXTEND,
        apply: (base: number, value: number) => base * (1 + value),
    },

    INT: {
        id: BuffId.INT,
        category: BuffCategory.MAGIC,
        name: BuffName.INT,
        stackRule: StackRule.EXTEND,
        apply: (base: number, value: number) => base * (1 + value),
    },

    SPD: {
        id: BuffId.SPD,
        category: BuffCategory.SPEED,
        name: BuffName.SPD,
        stackRule: StackRule.EXTEND,
        apply: (base: number, value: number) => base * (1 + value),
    },

    AGGRO: {
        id: BuffId.AGGRO,
        category: BuffCategory.AGGRO,
        name: BuffName.AGGRO,
        stackRule: StackRule.REPLACE,
        apply: (_: number, value: number) => value,  // _ は使わないよ
    },
} as const;
