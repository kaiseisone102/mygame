// src/shared/master/battle/Skills.ts

import { EffectScope, ElementId, SkillCategory, TargetSide } from "../../type/battle/skill/skillFormula";
import { BuffPower } from "../../type/battle/status/BuffPower";
import { StatusCategory } from "../../type/battle/status/StatusCategory";
import { StatusId } from "../../type/battle/status/StatusEffect";
import { TargetType } from "../../type/battle/TargetType";
import { SkillPreset } from "./type/SkillPreset";

export const SkillPresets = {

    //物理攻撃系（ATTACK / TECHNIQUE）
    ATTACK: {
        id: "attack",
        name: "こうげき",
        category: "ATTACK",
        cost: { mp: 0 },
        targetSide: "ENEMY",
        targetType: TargetType.SINGLE_ENEMY,
        effectScope: "SINGLE",
        effects: [
            {
                type: "DAMAGE",
                formula: "ATK_DEF",
                power: 0    // ← 攻撃力依存
            }
        ]
    },

    DOUBLE_ATTACK: {
        id: "double_attack",
        name: "二回攻撃",
        category: "ATTACK",
        cost: { mp: 0 },
        targetSide: "ENEMY",
        targetType: TargetType.SINGLE_ENEMY,
        effectScope: "SINGLE",
        effects: [
            {
                type: "DAMAGE",
                formula: "ATK_RATE",
                power: 0,    // ← 攻撃力依存
                rate: 0.55
            }
        ]
    },

    POWER_SLASH: {
        id: "power_slash",
        name: "渾身斬り",
        category: "TECHNIQUE",
        cost: { mp: 3 },
        targetSide: "ENEMY",
        targetType: TargetType.SINGLE_ENEMY,
        effectScope: "SINGLE",
        effects: [
            {
                type: "DAMAGE",
                formula: "ATK_RATE",
                power: 0,
                rate: 1.8,
                element: ElementId.SLASH,
            }
        ]
    },

    WHIRL_WIND: {
        id: "whirlwind",
        name: "なぎ払い",
        category: "TECHNIQUE",
        cost: { mp: 5 },
        targetSide: "ENEMY",
        targetType: TargetType.GROUP_ENEMY,
        effectScope: "GROUP",
        effects: [
            {
                type: "DAMAGE",
                formula: "ATK_RATE",
                power: 0,
                rate: 1.1
            }
        ]
    },

    BACK_STAB: {
        id: "backstab",
        name: "バックスタブ",
        category: "TECHNIQUE",
        cost: { mp: 4 },
        targetSide: "ENEMY",
        targetType: TargetType.SINGLE_ENEMY,
        effectScope: "SINGLE",
        effects: [
            {
                type: "DAMAGE",
                formula: "ATK_RATE",
                power: 0,
                rate: 3
            }
        ]
    },

    //属性魔法（MAGIC）🔥 火
    MERA: {
        id: "mera",
        name: "メラ",
        category: "MAGIC",
        cost: { mp: 2 },
        targetSide: "ENEMY",
        targetType: TargetType.SINGLE_ENEMY,
        effectScope: "SINGLE",
        element: ElementId.FIRE,
        effects: [
            {
                type: "DAMAGE",
                formula: "MAGIC",
                power: 12,
                element: ElementId.FIRE
            }
        ]
    },

    GIRA: {
        id: "gira",
        name: "ギラ",
        category: "MAGIC",
        cost: { mp: 4 },
        targetSide: "ENEMY",
        targetType: TargetType.GROUP_ENEMY,
        effectScope: "GROUP",
        element: ElementId.FIRE,
        effects: [
            {
                type: "DAMAGE",
                formula: "MAGIC",
                power: 18,
                element: ElementId.FIRE
            }
        ]
    },

    IO: {
        id: "io",
        name: "イオ",
        category: "MAGIC",
        cost: { mp: 6 },
        targetSide: "ENEMY",
        targetType: TargetType.GROUP_ENEMY,
        effectScope: "GROUP",
        element: ElementId.IMPACT,
        effects: [
            {
                type: "DAMAGE",
                formula: "MAGIC",
                power: 18,
                element: ElementId.IMPACT
            }
        ]
    },

    // ❄ 氷 / ⚡ 雷 / 🌪 風

    HYADO: {
        id: "hyado",
        name: "ヒャド",
        category: "MAGIC",
        cost: { mp: 3 },
        targetSide: "ENEMY",
        targetType: TargetType.SINGLE_ENEMY,
        effectScope: "SINGLE",
        element: ElementId.ICE,
        effects: [
            {
                type: "DAMAGE",
                formula: "MAGIC",
                power: 18,
                element: ElementId.ICE
            }
        ]
    },

    RAIDEIN: {
        id: "raidein",
        name: "ライデイン",
        category: "MAGIC",
        cost: { mp: 8 },
        targetSide: "ENEMY",
        targetType: TargetType.SINGLE_ENEMY,
        effectScope: "SINGLE",
        element: ElementId.ELECTRICITY,
        effects: [
            {
                type: "DAMAGE",
                formula: "MAGIC",
                power: 18,
                element: ElementId.ELECTRICITY
            }
        ]
    },

    BAGI: {
        id: "bagi",
        name: "バギ",
        category: "MAGIC",
        cost: { mp: 5 },
        targetSide: "ENEMY",
        targetType: TargetType.GROUP_ENEMY,
        effectScope: "GROUP",
        element: ElementId.WIND,
        effects: [
            {
                type: "DAMAGE",
                formula: "MAGIC",
                power: 18,
                element: ElementId.WIND
            }
        ]
    },

    // 回復魔法（MAGIC）
    HEAL: {
        id: "heal",
        name: "ヒール",
        category: "MAGIC",
        cost: { mp: 3 },
        targetSide: "ALLY",
        targetType: TargetType.SINGLE_ALLY,
        effectScope: "SINGLE",
        element: ElementId.NONE,
        effects: [
            { type: "HEAL", power: 30 }
        ]
    },

    HEAL_ALL: {
        id: "heal_all",
        name: "ヒールオール",
        category: "MAGIC",
        cost: { mp: 1 },
        targetSide: "ALLY",
        targetType: TargetType.ALL_ALLIES,
        effectScope: "ALL",
        effects: [
            { type: "HEAL", power: 35 }
        ]
    },

    REVIVE: {
        id: "revive",
        name: "リザレクト",
        category: "MAGIC",
        cost: { mp: 2 },
        targetSide: "ALLY",
        targetType: TargetType.SINGLE_ALLY,
        effectScope: "SINGLE",
        effects: [
            { type: "HEAL", power: 30 }
        ]
    },

    //強化（バフ）
    ATK_UP_SMALL: {
        id: "atk_up_small",
        name: "ちからため",
        category: "MAGIC",
        cost: { mp: 2 },
        targetSide: "ALLY",
        targetType: TargetType.SINGLE_ALLY,
        effectScope: "SINGLE",
        effects: [
            {
                type: "BUFF",
                buffId: "ATK",
                value: BuffPower.SMALL,
                turns: 3
            }
        ]
    },

    ATK_UP_LARGE: {
        id: "atk_up_large",
        name: "バイキルト",
        category: "MAGIC",
        cost: { mp: 4 },
        targetSide: "ALLY",
        targetType: TargetType.SINGLE_ALLY,
        effectScope: "SINGLE",
        effects: [
            {
                type: "BUFF",
                buffId: "ATK",
                value: BuffPower.LARGE,
                turns: 3
            }
        ]
    },

    DEF_UP: {
        id: "def_up",
        name: "スクルト",
        category: "MAGIC",
        cost: { mp: 4 },
        targetSide: "ALLY",
        targetType: TargetType.ALL_ALLIES,
        effectScope: "ALL",
        effects: [
            {
                type: "BUFF",
                buffId: "DEF",
                value: BuffPower.SMALL,
                turns: 3
            }
        ]
    },

    HASTE: {
        id: "haste",
        name: "ヘイスト",
        category: "MAGIC",
        cost: { mp: 5 },
        targetSide: "ALLY",
        targetType: TargetType.ALL_ALLIES,
        effectScope: "ALL",
        effects: [
            {
                type: "BUFF",
                buffId: "SPD",
                value: BuffPower.SMALL,
                turns: 3
            }
        ]
    },

    // 弱体（デバフ）
    ATK_DOWN: {
        id: "atk_down",
        name: "ルカニ",
        category: "MAGIC",
        cost: { mp: 4 },
        targetSide: "ENEMY",
        targetType: TargetType.GROUP_ENEMY,
        effectScope: "GROUP",
        effects: [
            {
                type: "BUFF",
                buffId: "ATK",
                value: -BuffPower.SMALL,
                turns: 3
            }
        ]
    },

    SLOW: {
        id: "slow",
        name: "スロウ",
        category: "MAGIC",
        cost: { mp: 4 },
        targetSide: "ENEMY",
        targetType: TargetType.GROUP_ENEMY,
        effectScope: "GROUP",
        effects: [
            {
                type: "BUFF",
                buffId: "SPD",
                value: -BuffPower.SMALL,
                turns: 3
            }
        ]
    },

    // 状態異常
    SLEEP: {
        id: "SLEEP",
        name: "ラリホー",
        category: "MAGIC",
        cost: { mp: 4 },
        targetSide: "ENEMY",
        targetType: TargetType.GROUP_ENEMY,
        effectScope: "GROUP",
        effects: [
            {
                type: "STATUS",
                statusId: "SLEEP",
                status: StatusId.SLEEP,
                chance: 0.6,
            },
        ],
    },

    POISON: {
        id: "POISON",
        name: "ポイズン",
        category: "MAGIC",
        cost: { mp: 3 },
        targetSide: "ENEMY",
        targetType: TargetType.GROUP_ENEMY,
        effectScope: "GROUP",
        element: ElementId.NONE,
        effects: [
            {
                type: "STATUS",
                statusId: "POISON",
                status: StatusId.POISON,
                chance: 0.7,
            },
        ],
    },

    PARALYZE: {
        id: "paralyze",
        name: "マヒャド",
        category: "MAGIC",
        cost: { mp: 5 },
        targetSide: "ENEMY",
        targetType: TargetType.SINGLE_ENEMY,
        effectScope: "SINGLE",
        effects: [
            {
                type: "STATUS",
                statusId: "PARALYSIS",
                status: StatusCategory.PARALYSIS,
                chance: 0.4,
            },
        ],
    },

    // 特殊・戦術系
    GUARD: {
        id: "guard",
        name: "ぼうぎょ",
        category: "TECHNIQUE",
        cost: { mp: 0 },
        targetSide: "SELF",
        targetType: TargetType.SELF,
        effectScope: "SINGLE",
        effects: []
    },

    PROVOKE: {
        id: "provoke",
        name: "挑発",
        category: "TECHNIQUE",
        cost: { mp: 2 },
        targetSide: "ENEMY",
        targetType: TargetType.GROUP_ENEMY,
        effectScope: "GROUP",
        effects: [
            {
                type: "BUFF",
                buffId: "AGGRO",
                value: 1,
                turns: 2
            }
        ]
    },

    ESCAPE: {
        id: "escape",
        name: "にげる",
        category: "TECHNIQUE",
        cost: { mp: 0 },
        targetSide: "SELF",
        targetType: TargetType.SELF,
        effectScope: "SINGLE",
        element: ElementId.NONE,
        effects: []
    },

    // 必殺・ユニーク
    LIMIT_BREAKE: {
        id: "limit_break",
        name: "リミットブレイク",
        category: "TECHNIQUE",
        cost: { mp: 0 },
        targetSide: "ENEMY",
        targetType: TargetType.ALL_ENEMIES,
        effectScope: "ALL",
        effects: [
            {
                type: "DAMAGE",
                formula: "ATK_RATE",
                power: 0,
                rate: 1.8
            }
        ]
    },

    GIGADEIN: {
        id: "gigadein",
        name: "ギガデイン",
        category: SkillCategory.MAGIC,
        cost: { mp: 30 },
        targetSide: TargetSide.ENEMY,
        targetType: TargetType.ALL_ENEMIES,
        effectScope: EffectScope.ALL,
        effects: [
            {
                type: "DAMAGE",
                formula: "MAGIC",
                power: 80,
                element: ElementId.ELECTRICITY
            }
        ]
    },
} as const satisfies Record<string, SkillPreset>;

export const SkillPresetsById: Record<string, SkillPreset> =
    Object.values(SkillPresets).reduce((acc, preset) => {
        acc[preset.id] = preset;
        return acc;
    }, {} as Record<string, SkillPreset>);