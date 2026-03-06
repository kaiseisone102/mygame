// src/shared/type/battle/status/StatusEffect.ts

import { BattleAction } from "../BattleAction";
import { BattlerPort } from "../port/BattlerPort";
import { ActionRewriteContext } from "./context/ActionRewriteContext";
import { StatusContext } from "./context/statusContext";
import { StatusSource } from "./context/StatusSource";
import { StackRule } from "./StackRule";
import { StatusCategory } from "./StatusCategory";

/* =====================
  ステータス効果定義
===================== */
export type StatusEffect = {
    id: string;
    category: StatusCategory;

    /** 効果優先度。高いほど先に処理される */
    priority: number;
    /** 残りターン数。-1 = 永続 */
    duration: number;
    /** 同カテゴリ重複時のルール */
    stackRule: StackRule;
    /** crateStatus 用 */
    context?: StatusSource;

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
