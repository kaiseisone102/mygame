// src/shared/master/item/Items.ts

import { SkillEffectKind } from "../../type/battle/skill/SkillEffect";
import { TargetType } from "../../type/battle/TargetType";

export type ItemPreset = {
    id: string;
    name: string;
    consumable: boolean;
    targetType: TargetType;
    effects: readonly SkillEffectKind[];
};

export const ItemPresets = {
    POTION: {
        id: "healRoot",
        name: "やくそう",
        consumable: true,
        targetType: TargetType.SINGLE_ALLY,
        effects: [
            { type: "HEAL", power: 30 }
        ]
    },

    BOMB: {
        id: "bomb",
        name: "ばくだん",
        consumable: true,
        targetType: TargetType.SINGLE_ENEMY,
        effects: [
            { type: "DAMAGE", formula: "FIXED", power: 50 }
        ]
    },

    ELIXIR: {
        id: "elixir",
        name: "エリクサー",
        consumable: true,
        targetType: TargetType.ALL_ALLIES,
        effects: [
            { type: "HEAL", power: 100 }
        ]
    }

} as const;

export const ItemPresetsById =
    Object.values(ItemPresets).reduce((acc, preset) => {
        acc[preset.id] = preset;
        return acc;
    }, {} as Record<string, ItemPreset>);