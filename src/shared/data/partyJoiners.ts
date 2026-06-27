// src/shared/data/partyJoiners.ts

import { AiType } from "../master/battle/type/EnemyPreset ";
import { MagicId, TechniqueId } from "../master/battle/type/SkillPreset";
import { TraitId } from "../master/battle/TraitPresets";
import { JobId } from "../type/job/JobId";
import { BattlerSaveData } from "./BattlerSaveData";

/**
 * 後から加入する仲間。
 * プレイヤーの分身(BRAVER)はパーティ先頭で最初からいる。
 * この3人はストーリー進行で GameState.joinAlly() により加入する。
 */
export const JoinableAllyId = {
    AKIBACHOTE: "AKIBACHOTE",   // アキバチョーテ (MAGE)
    DOUBLE_BED: "DOUBLE_BED",   // ダブルベッド（２段） (PRIEST)
    HARAMAKI: "HARAMAKI",       // はらまき (WARRIOR)
} as const;
export type JoinableAllyId = typeof JoinableAllyId[keyof typeof JoinableAllyId];

/** 加入メンバーのテンプレ。instanceId は加入時に採番するため含めない。 */
export type JoinerTemplate = Omit<BattlerSaveData, "instanceId">;

export const JOINABLE_ALLIES: Record<JoinableAllyId, JoinerTemplate> = {
    // 2人目: 魔法使い
    [JoinableAllyId.AKIBACHOTE]: {
        actorMasterId: 2,
        name: "アキバチョーテ",
        job: JobId.MAGE,
        level: 1,
        exp: 0,
        baseStats: {
            hp: 70, maxHp: 70, mp: 60, maxMp: 60,
            attack: 4, defense: 3, magic: 14, speed: 8, luck: 5, avoid: 0, critical: 0,
        },
        skillIds: [MagicId.MERA, MagicId.GIGADEIN, MagicId.HASTE],
        traits: [TraitId.RESIST_MAGIC_LIGHT],
        statusEffects: [],
        aiType: AiType.AGGRESSIVE,
        equipment: {},
    },

    // 3人目: 僧侶
    [JoinableAllyId.DOUBLE_BED]: {
        actorMasterId: 3,
        name: "ダブルベッド（２段）",
        job: JobId.PRIEST,
        level: 1,
        exp: 0,
        baseStats: {
            hp: 90, maxHp: 90, mp: 50, maxMp: 50,
            attack: 5, defense: 5, magic: 10, speed: 7, luck: 6, avoid: 0, critical: 0,
        },
        skillIds: [MagicId.HEAL_ALL, MagicId.ATK_DOWN],
        traits: [TraitId.AUTO_REGEN],
        statusEffects: [],
        aiType: AiType.AGGRESSIVE,
        equipment: {},
    },

    // 4人目: 戦士
    [JoinableAllyId.HARAMAKI]: {
        actorMasterId: 4,
        name: "はらまき",
        job: JobId.WARRIOR,
        level: 1,
        exp: 0,
        baseStats: {
            hp: 120, maxHp: 120, mp: 10, maxMp: 10,
            attack: 12, defense: 9, magic: 2, speed: 6, luck: 5, avoid: 0, critical: 0,
        },
        skillIds: [TechniqueId.POWER_SLASH, TechniqueId.WHIRL_WIND, TechniqueId.DOUBLE_ATTACK],
        traits: [],
        statusEffects: [],
        aiType: AiType.AGGRESSIVE,
        equipment: {},
    },
};
