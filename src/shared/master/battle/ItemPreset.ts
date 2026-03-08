// src/shared/master/item/Items.ts

import { SkillEffectKind } from "../../type/battle/skill/SkillEffect";
import { TargetType } from "../../type/battle/TargetType";
import { SkillId } from "./type/SkillPreset";

export type ItemPreset = {
    id: SkillId;
    name: string;
    consumable: boolean;
    targetType: TargetType;
    effects: readonly SkillEffectKind[];
};

export const ItemPresets = {
    POTION: {
        id: SkillId.ATK_DOWN,
        name: "やくそう",
        consumable: true,
        targetType: TargetType.SINGLE_ALLY,
        effects: [
            { type: "HEAL", power: 30 }
        ]
    },

    BOMB: {
        id: SkillId.ATK_DOWN,
        name: "ばくだん",
        consumable: true,
        targetType: TargetType.SINGLE_ENEMY,
        effects: [
            { type: "DAMAGE", formula: "FIXED", power: 50 }
        ]
    },

    ELIXIR: {
        id: SkillId.ATK_DOWN,
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