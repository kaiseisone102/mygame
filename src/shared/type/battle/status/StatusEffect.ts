// src/shared/type/battle/status/StatusEffect.ts

import { BattleAction } from "../BattleAction";
import { ActionRewriteContext } from "./context/ActionRewriteContext";
import { StatusContext } from "./context/statusContext";
import { StackRule } from "./StackRule";
import { StatusCategory } from "./StatusCategory";

/* =====================
  ステータス効果定義
===================== */
export type StatusEffect = {
    id: StatusId;
    category: StatusCategory;
    /** 処理順（高いほど先に処理） */
    order?: number;
    /** 効果優先度（強さ比較用） */
    priority: number;
    /** 同カテゴリ重複時のルール */
    stackRule: StackRule;

    /** 適用時の処理 */
    onApply?: (ctx: StatusContext) => void;
    /** ターン開始時の処理 */
    onTurnStart?: (ctx: StatusContext) => void;
    /** 行動前判定。falseなら行動不可 */
    onBeforeAction?: (ctx: StatusContext) => boolean;
    // 異常行動
    onRewriteAction?: (
        action: BattleAction,
        ctx: ActionRewriteContext
    ) => BattleAction;
    /** ターン開始時に解除されるか判定 */
    shouldExpire?: () => boolean;
    /** 効果解除時 */
    onExpire?: (ctx: StatusContext) => void;
};

export const StatusId = {
    CONFUSION: "CONFUSION",
    CHARM: "CHARM",
    PARALYSIS: "PARALYSIS",
    SLEEP: "SLEEP",
    STRONG_SLEEP: "STRONG_SLEEP",
    POISON: "POISON",
    STRONG_POISON: "STRONG_POISON",

    STUN: "STUN",

    DEAD: "DEAD"
} as const;
export type StatusId = typeof StatusId[keyof typeof StatusId];