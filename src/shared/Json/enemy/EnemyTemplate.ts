import { BattlerSide } from "../../type/battle/BattleAction";
import { BaseStats } from "../../../renderer/game/battle/core/Battler";

export const EnemyTemplateId = {
    SLIME: "SLIME", DRACKY: "DRACKY", GHOST: "GHOST"
} as const;
export type EnemyTemplateId = typeof EnemyTemplateId[keyof typeof EnemyTemplateId];

export interface EnemyTemplateJson {
    id: number;
    name: string;
    side: BattlerSide;

    level: number;
    exp: number;

    baseStats: {
        hp: number;
        mp: number;
        attack: number;
        defense: number;
        magic: number;
        speed: number;
    };

    growthTable?: Record<number, Partial<BaseStats>>;

    statModifier?: number;
    skills?: string[];
    traits?: string[];
    aiType?: string;
}

export type EnemyMasterJson = Record<
    EnemyTemplateId,
    EnemyTemplateJson
>;
