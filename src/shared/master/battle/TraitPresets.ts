// src/shared/master/battle/TraitPresets.ts

import { BattlerPort } from "../../type/battle/port/BattlerPort";
import { ElementId, SkillCategory } from "../../type/battle/skill/skillFormula";
import { resistCategoryLogic } from "../../type/battle/trait/logic/resistCategoryLogic";
import { resistElementLogic } from "../../type/battle/trait/logic/weakElementLogic";
import { TraitType } from "../../type/battle/trait/TraitType";


export const TraitPresetId = {
    WEAK_FIRE: "WEAK_FIRE", WEAK_FIRE_STRONG: "WEAK_FIRE_STRONG", RESIST_MAGIC: "RESIST_MAGIC", RESIST_MAGIC_LIGHT: "RESIST_MAGIC_LIGHT", MP_COST_DOWN: "MP_COST_DOWN",
    AUTO_REGEN: "AUTO_REGEN"
} as const;
export type TraitPreset = typeof TraitPresetId[keyof typeof TraitPresetId]

export const TraitPresets = {
    WEAK_FIRE: {
        id: TraitPresetId.WEAK_FIRE,
        type: TraitType.WEAKNESS,
        ...resistElementLogic(ElementId.FIRE, 1.5),
    },

    WEAK_FIRE_STRONG: {
        id: TraitPresetId.WEAK_FIRE_STRONG,
        type: TraitType.WEAKNESS,
        ...resistElementLogic(ElementId.FIRE, 2.0),
    },

    RESIST_MAGIC: {
        id: TraitPresetId.RESIST_MAGIC,
        type: TraitType.RESIST,
        ...resistCategoryLogic(SkillCategory.MAGIC, 0.5),
    },

    RESIST_MAGIC_LIGHT: {
        id: TraitPresetId.RESIST_MAGIC_LIGHT,
        type: TraitType.RESIST,
        ...resistCategoryLogic(SkillCategory.MAGIC, 0.8),
    },

    MP_COST_DOWN: {
        id: TraitPresetId.MP_COST_DOWN,
        type: TraitType.UTILITY,
        onMpCost: (cost: number) => Math.max(1, Math.floor(cost * 0.8)),
    },

    AUTO_REGEN: {
        id: TraitPresetId.AUTO_REGEN,
        type: TraitType.UTILITY,
        onTurnStart: (battler: BattlerPort) => {
            battler.hp = Math.min(battler.maxHp, battler.hp + 2);
        },
    },
} as const;
