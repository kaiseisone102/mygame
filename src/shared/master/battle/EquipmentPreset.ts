// src/shared/master/battle/EquipmentPreset.ts

import { BaseStats } from "../../data/playerConstants";
import { EquipmentMap, EquipSlot } from "../../type/equipment/EquipSlot";
import { JobId } from "../../type/job/JobId";
import { TraitId } from "./TraitPresets";

/**
 * 装備ID。
 * アイテムID(ItemId)やスキルID(SkillId)とは別系統で管理する。
 */
export const EquipmentId = {
    // --- 武器 ---
    RUSTY_SWORD: "RUSTY_SWORD",
    IRON_SWORD: "IRON_SWORD",
    OAK_STAFF: "OAK_STAFF",
    HOLY_MACE: "HOLY_MACE",
    // --- 盾 ---
    WOODEN_SHIELD: "WOODEN_SHIELD",
    IRON_SHIELD: "IRON_SHIELD",
    // --- 頭 ---
    LEATHER_CAP: "LEATHER_CAP",
    IRON_HELM: "IRON_HELM",
    // --- 体 ---
    LEATHER_ARMOR: "LEATHER_ARMOR",
    SAGE_ROBE: "SAGE_ROBE",
    // --- 装飾 ---
    POWER_RING: "POWER_RING",
    MAGIC_RING: "MAGIC_RING",
} as const;
export type EquipmentId = typeof EquipmentId[keyof typeof EquipmentId];

/**
 * 装備マスタの1件分。
 * - stats     : 基礎値への固定加算ボーナス(StatCalculator で base の直後に足される)
 * - traits    : 装備で付与される特性(既存 TraitPresets を流用)。任意。
 * - equipableJobs : 装備可能な職。省略時は全職OK。
 */
export type EquipmentPreset = {
    id: EquipmentId;
    name: string;
    slot: EquipSlot;
    stats: Partial<BaseStats>;
    traits?: TraitId[];
    equipableJobs?: JobId[];
    price: number;
    description: string;
};

/**
 * 装備マスタ。
 * stats は既存の BaseStats のキーをそのまま使うので、計算側(StatCalculator)の追加が要らない。
 */
export const EquipmentPresets: Record<EquipmentId, EquipmentPreset> = {
    // ===== 武器(WEAPON) =====
    [EquipmentId.RUSTY_SWORD]: {
        id: EquipmentId.RUSTY_SWORD,
        name: "さびた剣",
        slot: EquipSlot.WEAPON,
        stats: { attack: 3 },
        equipableJobs: [JobId.BRAVER, JobId.WARRIOR],
        price: 120,
        description: "刃こぼれした剣。無いよりはマシ。攻撃+3。",
    },
    [EquipmentId.IRON_SWORD]: {
        id: EquipmentId.IRON_SWORD,
        name: "鉄の剣",
        slot: EquipSlot.WEAPON,
        stats: { attack: 8 },
        equipableJobs: [JobId.BRAVER, JobId.WARRIOR],
        price: 480,
        description: "しっかりした鉄製の剣。攻撃+8。",
    },
    [EquipmentId.OAK_STAFF]: {
        id: EquipmentId.OAK_STAFF,
        name: "樫の杖",
        slot: EquipSlot.WEAPON,
        stats: { magic: 4, attack: 1 },
        equipableJobs: [JobId.MAGE, JobId.PRIEST],
        price: 200,
        description: "魔力を通しやすい杖。魔法+4。",
    },
    [EquipmentId.HOLY_MACE]: {
        id: EquipmentId.HOLY_MACE,
        name: "聖なるメイス",
        slot: EquipSlot.WEAPON,
        stats: { attack: 4, magic: 3 },
        traits: [TraitId.AUTO_REGEN],
        equipableJobs: [JobId.PRIEST],
        price: 620,
        description: "僧侶専用。攻撃+4 魔法+3、毎ターン少し回復する。",
    },

    // ===== 盾(SHIELD) =====
    [EquipmentId.WOODEN_SHIELD]: {
        id: EquipmentId.WOODEN_SHIELD,
        name: "木の盾",
        slot: EquipSlot.SHIELD,
        stats: { defense: 2 },
        equipableJobs: [JobId.BRAVER, JobId.WARRIOR, JobId.PRIEST],
        price: 90,
        description: "軽い木の盾。防御+2。",
    },
    [EquipmentId.IRON_SHIELD]: {
        id: EquipmentId.IRON_SHIELD,
        name: "鉄の盾",
        slot: EquipSlot.SHIELD,
        stats: { defense: 5, speed: -1 },
        equipableJobs: [JobId.BRAVER, JobId.WARRIOR],
        price: 320,
        description: "重い鉄の盾。防御+5、素早さ-1。",
    },

    // ===== 頭(HEAD) =====
    [EquipmentId.LEATHER_CAP]: {
        id: EquipmentId.LEATHER_CAP,
        name: "革の帽子",
        slot: EquipSlot.HEAD,
        stats: { defense: 2 },
        price: 80,
        description: "ちょっとした守り。防御+2。(全職OK)",
    },
    [EquipmentId.IRON_HELM]: {
        id: EquipmentId.IRON_HELM,
        name: "鉄かぶと",
        slot: EquipSlot.HEAD,
        stats: { defense: 4, speed: -1 },
        equipableJobs: [JobId.BRAVER, JobId.WARRIOR],
        price: 300,
        description: "頑丈な兜。防御+4、素早さ-1。",
    },

    // ===== 体(BODY) =====
    [EquipmentId.LEATHER_ARMOR]: {
        id: EquipmentId.LEATHER_ARMOR,
        name: "革の鎧",
        slot: EquipSlot.BODY,
        stats: { defense: 4 },
        price: 200,
        description: "動きやすい革の鎧。防御+4。(全職OK)",
    },
    [EquipmentId.SAGE_ROBE]: {
        id: EquipmentId.SAGE_ROBE,
        name: "賢者のローブ",
        slot: EquipSlot.BODY,
        stats: { defense: 3, magic: 2, maxMp: 10 },
        traits: [TraitId.RESIST_MAGIC_LIGHT],
        equipableJobs: [JobId.MAGE, JobId.PRIEST],
        price: 600,
        description: "魔法耐性のローブ。防御+3 魔法+2 最大MP+10。",
    },

    // ===== 装飾(ACCESSORY) =====
    [EquipmentId.POWER_RING]: {
        id: EquipmentId.POWER_RING,
        name: "力の指輪",
        slot: EquipSlot.ACCESSORY,
        stats: { attack: 2, magic: 2 },
        price: 500,
        description: "ほんの少し全能力を底上げ。攻撃+2 魔法+2。(全職OK)",
    },
    [EquipmentId.MAGIC_RING]: {
        id: EquipmentId.MAGIC_RING,
        name: "魔力の指輪",
        slot: EquipSlot.ACCESSORY,
        stats: { magic: 3, maxMp: 5 },
        traits: [TraitId.MP_COST_DOWN],
        equipableJobs: [JobId.MAGE, JobId.PRIEST],
        price: 550,
        description: "魔法+3 最大MP+5、MP消費を少し抑える。",
    },
};

/** 全装備IDの一覧 */
export const ALL_EQUIPMENT_IDS = Object.keys(EquipmentPresets) as EquipmentId[];

/** 装備IDがマスタに存在するか */
export function isEquipmentId(id: string): id is EquipmentId {
    return id in EquipmentPresets;
}

/** 装備IDから装備プリセットを取得(存在しなければ undefined) */
export function getEquipmentById(id: string): EquipmentPreset | undefined {
    return EquipmentPresets[id as EquipmentId];
}

/** その装備を指定の職が装備できるか(equipableJobs 省略時は全職OK) */
export function canEquipByJob(preset: EquipmentPreset, job: JobId): boolean {
    return !preset.equipableJobs || preset.equipableJobs.includes(job);
}

/**
 * 着用中の装備すべての stats を合算する。
 * 戦闘側(Battler.equipBonus)・表示側(finalStatsOf)の両方がこれを使うので数値が一致する。
 */
export function sumEquipBonus(equipment?: EquipmentMap): Partial<BaseStats> {
    const bonus: Partial<BaseStats> = {};
    if (!equipment) return bonus;

    for (const slot of Object.keys(equipment) as EquipSlot[]) {
        const id = equipment[slot];
        if (!id) continue;
        const preset = getEquipmentById(id);
        if (!preset) continue;

        for (const key of Object.keys(preset.stats) as (keyof BaseStats)[]) {
            bonus[key] = (bonus[key] ?? 0) + (preset.stats[key] ?? 0);
        }
    }
    return bonus;
}

/**
 * 装備由来の Trait に付けるタグ。
 * 戦闘後の永続化(BattleResultService)でこのタグを持つ Trait を除外し、
 * 装備特性が baseData.traits に焼き込まれて毎戦累積するのを防ぐ。
 */
export const EQUIP_TRAIT_TAG = "__EQUIP__";

/** 着用中の装備が付与する特性IDをまとめて取得する。 */
export function getEquipmentTraitIds(equipment?: EquipmentMap): TraitId[] {
    if (!equipment) return [];
    const ids: TraitId[] = [];

    for (const slot of Object.keys(equipment) as EquipSlot[]) {
        const id = equipment[slot];
        if (!id) continue;
        const preset = getEquipmentById(id);
        if (preset?.traits) ids.push(...preset.traits);
    }
    return ids;
}

/**
 * 装備込みの最終ステータスを返す純関数(フィールド表示・着脱プレビュー用)。
 * - base を破壊せず、新しいオブジェクトを返す。
 * - hp / mp(現在値)は基礎値のまま。maxHp / maxMp や攻撃力などに装備ボーナスを足す。
 * ※ Trait の % 補正(BERSERKER 等)はここでは反映しない(戦闘中の値とは別途、装備加算のみ)。
 */
export function finalStatsOf(base: BaseStats, equipment?: EquipmentMap): BaseStats {
    const bonus = sumEquipBonus(equipment);
    const result: BaseStats = { ...base };

    for (const key of Object.keys(bonus) as (keyof BaseStats)[]) {
        result[key] = result[key] + (bonus[key] ?? 0);
    }
    return result;
}
