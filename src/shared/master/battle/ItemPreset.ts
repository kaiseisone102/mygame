// src/shared/master/battle/ItemPreset.ts

import { SkillEffectKind } from "../../type/battle/skill/SkillEffect";
import { TargetType } from "../../type/battle/TargetType";

/**
 * 道具ID。
 * スキルIDとは別系統で管理する(skillRepository は通さず、
 * 使用時に convertItemToSkill で実行用スキルへ変換する)。
 */
export const ItemId = {
    POTION: "POTION",
    HIGH_POTION: "HIGH_POTION",
    BOMB: "BOMB",
} as const;
export type ItemId = typeof ItemId[keyof typeof ItemId];

export type ItemPreset = {
    id: ItemId;
    name: string;
    consumable: boolean;
    targetType: TargetType;
    effects: readonly SkillEffectKind[];
    description: string;
};

/**
 * 道具マスタ。
 * effects は既存の SkillEffectKind をそのまま使うので、戦闘ロジック(SkillExecutor)を再利用できる。
 * 現状は既存の効果種別(HEAL / DAMAGE)で表現できるものに限定している。
 * MP回復・状態異常治療などは効果種別の追加が必要なため、ここには含めていない。
 */
export const ItemPresets: Record<ItemId, ItemPreset> = {
    [ItemId.POTION]: {
        id: ItemId.POTION,
        name: "やくそう",
        consumable: true,
        targetType: TargetType.SINGLE_ALLY,
        effects: [{ type: "HEAL", power: 30 }],
        description: "味方1人のHPを30回復する。",
    },

    [ItemId.HIGH_POTION]: {
        id: ItemId.HIGH_POTION,
        name: "じょうやくそう",
        consumable: true,
        targetType: TargetType.SINGLE_ALLY,
        effects: [{ type: "HEAL", power: 120 }],
        description: "味方1人のHPを120回復する。",
    },

    [ItemId.BOMB]: {
        id: ItemId.BOMB,
        name: "ばくだん",
        consumable: true,
        targetType: TargetType.SINGLE_ENEMY,
        effects: [{ type: "DAMAGE", formula: "FIXED", power: 50 }],
        description: "敵1体に50の固定ダメージを与える。",
    },
};

/** itemId 文字列からの逆引き(getSkillFromItem / ActionFactory 用) */
export const ItemPresetsById: Record<string, ItemPreset> = ItemPresets;
