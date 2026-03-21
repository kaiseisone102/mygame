// src/shared/master/battle/StatusPresets.ts

import { BaseStats } from "../../data/playerConstants";
import { BattleAction, StrangeAction } from "../../type/battle/BattleAction";
import { BattleEvent } from "../../type/battle/event/BattleEvent";
import { EventContext } from "../../type/battle/event/EventContext";
import { LARGE_PRIORITY, MID_PRIORITY, ORDER_ACTION_LOCK, ORDER_CONTROL, ORDER_DAMAGE, StatusTickType, VERY_LARGE_PRIORITY } from "../../type/battle/status/constants/statusConstant";
import { ActionRewriteContext } from "../../type/battle/status/context/ActionRewriteContext";
import { StatusContext } from "../../type/battle/status/context/statusContext";
import { confusionLogic } from "../../type/battle/status/logic/confusionLogic";
import { drainLogic } from "../../type/battle/status/logic/drainLogic";
import { poisonLogic } from "../../type/battle/status/logic/poisonLogic";
import { sleepLogic } from "../../type/battle/status/logic/sleepLogic";
import { StackRule } from "../../type/battle/status/StackRule";
import { ImageKey } from "../../type/ImageKey";
import { BuffName } from "./type/BuffPreset ";

// マスタデータ（不変）
export type StatusPreset = {
    readonly id: StatusId;
    readonly category: StatusCategory;

    // --- UI用メタデータ ---
    readonly name: string;         // 表示名（例: "猛毒"）
    readonly description: string;  // 説明文（例: "毎ターン、最大HPの15%のダメージを受ける。"）
    readonly iconKey: ImageKey;    // アイコン画像のリソースキー
    readonly color?: string;       // UI上の文字色
    // --------------------

    readonly stackRule: StackRule;
    readonly priority: number;  // 状態の上書き強度

    order: number;          // 複数の状態異常を持つとき 処理の順番
    duration?: number;
    value?: number;
    blocksAction?: boolean; // 行動不能か
    tickType?: StatusTickType;

} & StatusLogic;

// 実行時のインスタンス（可変）
export type StatusInstance = {
    readonly instanceId: number;
    readonly statusId: StatusId; // preset への参照

    duration: number;          // 残りターン数（動的に減る）
    value?: number;

    readonly actorId: number;   // 誰がかけたか
}

export type StatusLogic = {
    /** 行動前判定。falseなら行動不可 */
    onBeforeAction?: (ctx: StatusContext) => boolean;
    /** ターン開始時の処理 */
    onTurnStart?: (ctx: StatusContext) => void;
    /** ターン終了時の処理 */
    onTurnEnd?: (ctx: StatusContext) => void;
    /** 適用時の処理 */
    onApply?: (ctx: StatusContext) => void;
    /** ターン開始時に解除されるか判定 */
    shouldExpire?: () => boolean;
    /** 効果解除時 */
    onExpire?: (ctx: StatusContext) => void;

    onEvent?: (event: BattleEvent, ctx: EventContext) => void;

    // バフ・デバフ用のステータス補正関数
    statModifier?: (stat: keyof BaseStats, currentValue: number, instance: StatusInstance) => number;

    onTurnTick?: (ctx: StatusContext) => void;

    // 異常行動
    onRewriteAction?: (
        action: BattleAction,
        ctx: ActionRewriteContext
    ) => StrangeAction | undefined;
};

export const StatusId = {
    CONFUSION: "CONFUSION",
    CHARM: "CHARM",
    PARALYSIS: "PARALYSIS",
    SLEEP: "SLEEP",
    STRONG_SLEEP: "STRONG_SLEEP",
    POISON: "POISON",
    STRONG_POISON: "STRONG_POISON",
    FREEZE: "FREEZE",
    DRAIN: "DRAIN",
    STUN: "STUN",
    REGEN: "REGEN",
    DEAD: "DEAD",

    ATK: "ATK", DEF: "DEF", INT: "INT", SPD: "SPD", AGGRO: "AGGRO",
} as const;
export type StatusId = typeof StatusId[keyof typeof StatusId];

/* =====================
  ステータス効果カテゴリ
===================== */
export const StatusCategory = {
    ACTION_LOCK: "ACTION_LOCK",

    POISON: "POISON",
    BURN: "BURN",

    SHIELD: "SHIELD",
    REGEN: "REGEN",
    SPECIAL: "SPECIAL",

    ATTACK: "attack",
    DEFENSE: "defense",
    MAGIC: "magic",
    SPEED: "speed",
    AGGRO: "aggro"
} as const;
export type StatusCategory = typeof StatusCategory[keyof typeof StatusCategory];

export const StatusPresets: Record<StatusId, StatusPreset> = {

    CONFUSION: {
        id: "CONFUSION",
        name: "混乱",
        description: "意識が混濁し、一定確率で行動に失敗します。",
        iconKey: ImageKey.CONFUSION,
        color: "#ffff00", // 黄色

        category: StatusCategory.ACTION_LOCK,
        priority: 15,
        order: 10,
        duration: -1,
        stackRule: StackRule.REPLACE,
        ...confusionLogic({
            failRate: 0.3,
            recoverRate: 0.2,
        }),
    },

    CHARM: {
        id: "CHARM",
        name: "魅了",
        description: "意識が混濁し、一定確率で行動に失敗します。",
        iconKey: ImageKey.CONFUSION,
        color: "#ffff00", // 黄色

        category: StatusCategory.ACTION_LOCK,
        priority: 30,
        order: 10,
        duration: -1,
        stackRule: StackRule.REPLACE,
        ...confusionLogic({
            failRate: 0.8,    // 80%で行動がおかしくなる
            recoverRate: 0.1, // なかなか解けない
        }),
    },

    PARALYSIS: {
        id: "PARALYSIS",
        name: "麻痺",
        description: "体がしびれて、行動開始時に50%の確率で動けなくなります。",
        iconKey: ImageKey.PARALYSIS,
        category: StatusCategory.ACTION_LOCK,
        priority: 15,
        order: 80, // 睡眠(100)よりは低く、毒(50)よりは高い優先度
        duration: -1,
        stackRule: StackRule.IGNORE, // すでにかかっていたら上書きせず無視

        /**
         * 行動前判定
         * 50%の確率で行動不可にする
         */
        onBeforeAction: ({ target }: StatusContext) => {
            const canAct = Math.random() >= 0.5;
            if (!canAct) {
                console.log(`${target.name} は体がしびれて動けない！`);
            }
            return canAct;
        },

        /**
         * ターン開始時の自然治癒判定
         */
        shouldExpire: () => {
            // 20%で治る
            return Math.random() < 0.2;
        },

        /**
         * 解除時の処理
         */
        onExpire: ({ target, preset }: StatusContext) => {
            // 以前は battler.hp を表示していましたが、名前を表示する方が自然です
            console.log(`${target.name} の${preset.name}が治った！`);
        }
    },

    SLEEP: {
        id: "SLEEP",
        name: "睡眠",
        description: "眠りについてしまい、行動することができません。一定確率で目を覚まします。",
        iconKey: ImageKey.SLEEP,
        category: StatusCategory.ACTION_LOCK, // 行動不能カテゴリ
        priority: 10,
        order: 100, // 行動判定の最優先クラス
        duration: -1,
        stackRule: StackRule.REPLACE,

        // 眠っている間は行動不可 (常に false)
        onBeforeAction: () => false,

        // ターン開始時に 40% で解除判定
        shouldExpire: () => {
            return Math.random() < 0.4;
        },

        onExpire: ({ target, preset }: StatusContext) => {
            console.log(`${target.name} は目を覚ました`);
        }
    },

    STRONG_SLEEP: {
        id: "STRONG_SLEEP",
        name: "爆睡",
        description: "深い眠りに落ちています。通常の睡眠よりも目が覚めにくい状態です。",
        iconKey: ImageKey.SLEEP,
        category: StatusCategory.ACTION_LOCK, // 行動不能カテゴリ
        priority: 20, // priorityが高いので、普通の睡眠を上書きする
        order: 100, // 行動判定の最優先クラス
        duration: -1,
        stackRule: StackRule.REPLACE,

        // 20% でしか目が覚めない
        shouldExpire: () => Math.random() < 0.2,

        onExpire: ({ target, preset }: StatusContext) => {
            console.log(`${target.name} はようやく目を覚ました`);
        }
    },

    POISON: {
        id: "POISON",
        name: "毒",
        description: "体内の毒素により、行動開始時にダメージを受けます。",
        iconKey: ImageKey.POISON,
        color: "#a040a0", // 紫色

        category: StatusCategory.POISON,
        priority: 10,
        order: 50, // ダメージ処理は行動制限より後にしたい場合など
        duration: 3,
        stackRule: StackRule.EXTEND,
        tickType: StatusTickType.TURN_START, // どのタイミングで発動するか明示

        /**
         * ターン開始時の処理
         */
        onTurnTick: (ctx: StatusContext) => {
            // 最大HPの 5% ダメージ
            const damage = Math.floor(ctx.target.baseStats.maxHp * 0.05);

            // 1以下にはならない、などのルールがあればここで調整
            // 例: Math.max(1, damage)

            ctx.target.addHp(-damage);

            console.log(`${ctx.target.name} は毒で ${damage} のダメージを受けた！`);
        },

        // もし onTurnStart (ctx版) を使うなら以下
        onTurnStart: ({ target, preset }: StatusContext) => {
            // 必要に応じて、エフェクトの再生などをここに書く
        }
    },

    STRONG_POISON: {
        id: "STRONG_POISON",
        name: "猛毒",
        description: "体内の毒素により、行動開始時にダメージを受けます。",
        iconKey: ImageKey.POISON,
        color: "#a040a0", // 紫色

        category: StatusCategory.POISON,
        priority: 20, // 普通の毒より強い
        order: 50, // ダメージ処理は行動制限より後にしたい場合など
        duration: 3,
        stackRule: StackRule.EXTEND,
        tickType: StatusTickType.TURN_START, // どのタイミングで発動するか明示

        onTurnTick: (ctx: StatusContext) => {
            const damage = Math.floor(ctx.target.baseStats.maxHp * 0.15); // 15%ダメージ
            ctx.target.addHp(-damage);
        }
    },

    FREEZE: {
        id: StatusId.FREEZE,
        name: "凍結",
        description: "体内の毒素により、行動開始時にダメージを受けます。",
        iconKey: ImageKey.POISON,
        color: "#a040a0", // 紫色

        category: StatusCategory.ACTION_LOCK,
        order: ORDER_ACTION_LOCK,
        priority: LARGE_PRIORITY,
        duration: 3,
        stackRule: StackRule.IGNORE,
        blocksAction: true,
        statModifier(stat, value) {

            if (stat === "speed") {
                return 0;
            }

            return value;
        },
        onEvent(event, ctx) {

            if (event === BattleEvent.DAMAGE) {
                // ctx.removeSelf();
            }

        },
        onApply(target) {
            // 任意: エフェクトなど
        },

        onExpire(target) {
            // 任意: 解除演出
        }
    },

    DRAIN: {
        id: StatusId.DRAIN,
        name: "吸収",
        description: "体内の毒素により、行動開始時にダメージを受けます。",
        iconKey: ImageKey.POISON,
        color: "#a040a0", // 紫色

        category: StatusCategory.SPECIAL,
        order: 0,
        priority: 0,
        duration: -1,
        stackRule: StackRule.REPLACE,

        ...drainLogic(0.2)
    },


    STUN: {
        id: StatusId.STUN,
        name: "スタン",
        description: "体内の毒素により、行動開始時にダメージを受けます。",
        iconKey: ImageKey.POISON,
        color: "#a040a0", // 紫色

        category: StatusCategory.ACTION_LOCK,
        order: ORDER_ACTION_LOCK,
        priority: MID_PRIORITY,
        duration: -1,
        stackRule: StackRule.IGNORE,
        blocksAction: true,
    },

    REGEN: {
        id: StatusId.REGEN,
        name: "リジェネ",
        description: "体内の毒素により、行動開始時にダメージを受けます。",
        iconKey: ImageKey.POISON,
        color: "#a040a0", // 紫色

        category: StatusCategory.REGEN,
        order: ORDER_CONTROL,
        priority: MID_PRIORITY,
        duration: 5,
        stackRule: StackRule.EXTEND,
        tickType: StatusTickType.TURN_END,

        onTurnTick(ctx: StatusContext) {
            const heal = Math.floor(ctx.target.baseStats.maxHp * 0.05);
            ctx.target.addHp(heal);
        }
    },

    DEAD: {
        id: StatusId.DEAD,
        name: "戦闘不能",
        description: "体内の毒素により、行動開始時にダメージを受けます。",
        iconKey: ImageKey.POISON,
        color: "#a040a0", // 紫色

        category: StatusCategory.SPECIAL,
        order: 0,
        priority: VERY_LARGE_PRIORITY,
        duration: -1,
        stackRule: StackRule.IGNORE,
    },

    ATK: {
        id: StatusId.ATK,
        name: BuffName.ATK,
        description: "攻撃力",
        iconKey: ImageKey.CHARM,
        color: "#a040a0", // 紫色

        category: StatusCategory.ATTACK,
        priority: MID_PRIORITY,
        duration: 4,
        stackRule: StackRule.REPLACE,
        order: 10,
        statModifier: (stat, value, instance) => {
            if (stat !== "attack") return value;
            // instance.value に 0.2 (20%) などが入っている想定
            if (!instance.value) console.warn("statModifier cant found instance.value at processing", stat)
            return Math.ceil(value * (1 + (instance.value ?? 0.2)));
        }
    },

    DEF: {
        id: StatusId.DEF,
        name: BuffName.DEF,
        description: "防御力",
        iconKey: ImageKey.SLEEP,
        color: "#a040a0", // 紫色

        category: StatusCategory.DEFENSE,
        priority: MID_PRIORITY,
        duration: 4,
        stackRule: StackRule.REPLACE,
        order: 10,
        statModifier: (stat: keyof BaseStats, value, instance: StatusInstance) => {
            if (stat !== "defense") return value;
            // instance.value に 0.2 (20%) などが入っている想定
            if (!instance.value) console.warn("statModifier cant found instance.value at processing", stat)
            return Math.ceil(value * (1 + (instance.value ?? 0.2)));
        }
    },

    INT: {
        id: StatusId.INT,
        name: BuffName.INT,
        description: "賢さ",
        iconKey: ImageKey.POISON,
        color: "#a040a0", // 紫色

        category: StatusCategory.MAGIC,
        priority: MID_PRIORITY,
        duration: 4,
        stackRule: StackRule.REPLACE,
        order: 10,
        statModifier: (stat: keyof BaseStats, value, instance: StatusInstance) => {
            if (stat !== "magic") return value;
            // instance.value に 0.2 (20%) などが入っている想定
            if (!instance.value) console.warn("statModifier cant found instance.value at processing", stat)
            return Math.ceil(value * (1 + (instance.value ?? 0.2)));
        }
    },

    SPD: {
        id: StatusId.SPD,
        name: BuffName.SPD,
        description: "素早さ",
        iconKey: ImageKey.PARALYSIS,
        color: "#a040a0", // 紫色

        category: StatusCategory.SPEED,
        priority: MID_PRIORITY,
        duration: 4,
        stackRule: StackRule.REPLACE,
        order: 10,
        statModifier: (stat: keyof BaseStats, value, instance: StatusInstance) => {
            if (stat !== "speed") return value;
            // instance.value に 0.2 (20%) などが入っている想定
            if (!instance.value) console.warn("statModifier cant found instance.value at processing", stat)
            return Math.ceil(value * (1 + (instance.value ?? 0.2)));
        }
    },

    AGGRO: {
        id: StatusId.AGGRO,
        name: BuffName.AGGRO,
        description: "狙われやすさ",
        iconKey: ImageKey.POISON,
        color: "#a040a0", // 紫色

        category: StatusCategory.AGGRO,
        priority: MID_PRIORITY,
        duration: 4,
        stackRule: StackRule.REPLACE,
        order: 10,
        statModifier: (stat: keyof BaseStats, value, instance: StatusInstance) => {
            if (stat !== "avoid") return value;
            // instance.value に 0.2 (20%) などが入っている想定
            if (!instance.value) console.warn("statModifier cant found instance.value at processing", stat)
            return Math.ceil(value * (1 + (instance.value ?? 0.2)));
        }
    },
};