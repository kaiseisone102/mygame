// src/shared/master/battle/TraitPresets.ts

import { BaseStats } from "../../data/playerConstants";
import { BattlerPort } from "../../type/battle/port/BattlerPort";
import { ElementId, SkillCategory } from "../../type/battle/skill/skillFormula";
import { resistCategoryLogic } from "../../type/battle/trait/logic/resistCategoryLogic";
import { resistElementLogic } from "../../type/battle/trait/logic/weakElementLogic";
import { TraitType } from "../../type/battle/trait/TraitType";


export const TraitId = {
    WEAK_FIRE: "WEAK_FIRE", WEAK_FIRE_STRONG: "WEAK_FIRE_STRONG", RESIST_MAGIC: "RESIST_MAGIC", RESIST_MAGIC_LIGHT: "RESIST_MAGIC_LIGHT", MP_COST_DOWN: "MP_COST_DOWN",
    AUTO_REGEN: "AUTO_REGEN", BERSERKER: "BERSERKER"
} as const;
export type TraitId = typeof TraitId[keyof typeof TraitId]

export const TraitPresets = {
    WEAK_FIRE: {
        id: TraitId.WEAK_FIRE,
        type: TraitType.WEAKNESS,
        ...resistElementLogic(ElementId.FIRE, 1.5),
    },

    WEAK_FIRE_STRONG: {
        id: TraitId.WEAK_FIRE_STRONG,
        type: TraitType.WEAKNESS,
        ...resistElementLogic(ElementId.FIRE, 2.0),
    },

    RESIST_MAGIC: {
        id: TraitId.RESIST_MAGIC,
        type: TraitType.RESIST,
        ...resistCategoryLogic(SkillCategory.MAGIC, 0.5),
    },

    RESIST_MAGIC_LIGHT: {
        id: TraitId.RESIST_MAGIC_LIGHT,
        type: TraitType.RESIST,
        ...resistCategoryLogic(SkillCategory.MAGIC, 0.8),
    },

    MP_COST_DOWN: {
        id: TraitId.MP_COST_DOWN,
        type: TraitType.UTILITY,
        onMpCost: (cost: number) => Math.max(1, Math.floor(cost * 0.8)),
    },

    AUTO_REGEN: {
        id: TraitId.AUTO_REGEN,
        type: TraitType.UTILITY,
        onTurnStart: (battler: BattlerPort) => {
            battler.baseStats.hp = Math.min(battler.baseStats.maxHp, battler.baseStats.hp + 2);
        },
    },

    BERSERKER: {
        id: TraitId.BERSERKER,
        type: TraitType.UTILITY,
        modifyStat: (stat: keyof BaseStats, value: number): number => {
            if (stat === "attack") return Math.floor(value * 1.2)
            return value;
        }
    }
} as const;
