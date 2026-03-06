// src/renderer/input/mapping/InputMapper.ts

import { AppDirection } from "../../../shared/type/PlayerState";

// ----------------------------------------
// Axis定義
// ----------------------------------------

// 入力軸 (上下左右) の型
export type InputAxis = typeof AppDirection.UP | typeof AppDirection.DOWN | typeof AppDirection.LEFT | typeof AppDirection.RIGHT;

// キー → 入力軸のマッピング
// 複数キーで同じ軸に対応可能
export const CODE_TO_AXIS: Record<string, InputAxis | undefined> = {
    ArrowUp: AppDirection.UP,
    KeyW: AppDirection.UP,
    ArrowDown: AppDirection.DOWN,
    KeyS: AppDirection.DOWN,
    ArrowLeft: AppDirection.LEFT,
    KeyA: AppDirection.LEFT,
    ArrowRight: AppDirection.RIGHT,
    KeyD: AppDirection.RIGHT,
};

// ----------------------------------------
// Action定義
// ----------------------------------------

// 共通で使えるアクション (UI・ゲーム両方で使用可能)
export type CommonAction = | "CONFIRM" | "CANCEL" | "INVENTORY" | "TEST_CHANGE_WORLD" | "TEST_OPEN_OPTION";

// ゲーム専用アクション
// 共通アクションも含む
export type GameAction = | CommonAction | "ATTACK" | "JUMP";

// UI専用アクション
// 共通アクションも含む
export type UIAction = | CommonAction | "UI_ONLY_SOMETHING1" | "UI_ONLY_SOMETHING2"

// アクションの種類 (押下/離上)
export type ActionType = "pressed" | "released";

// ----------------------------------------
// Game / UI 用イベント型
// ----------------------------------------

// GAME向けイベント
export type GameActionEvent = { action: GameAction, type: ActionType };

// UI向けイベント
export type UIActionEvent = { action: UIAction, type: ActionType };

export type AxisEvent = {
    axis: InputAxis;
    type: ActionType;
};

// ----------------------------------------
// 汎用 ActionEvent 型
// - target で GAME / UI のどちらに流すかを判定できる
// ----------------------------------------
export type CommonActionEvent = { action: CommonAction, type: ActionType };

// ----------------------------------------
// キー → Action マッピング
// ----------------------------------------

// 共通アクション (GAME/UI両方対象)
export const CODE_TO_COMMON_ACTION: Record<string, CommonActionEvent | undefined> = {
    Enter: { action: "CONFIRM", type: "pressed" },
    Escape: { action: "CANCEL", type: "pressed" },
    Space: { action: "INVENTORY", type: "pressed" },
    KeyP: { action: "TEST_CHANGE_WORLD", type: "pressed" },
    KeyO: { action: "TEST_OPEN_OPTION", type: "pressed" }
};

// GAME専用アクション (UIには流さない)
export const CODE_TO_GAME_ACTION: Record<string, GameActionEvent | undefined> = {
    KeyZ: { action: "ATTACK", type: "pressed" },
    KeyX: { action: "JUMP", type: "pressed" },
};

// UI専用アクション (ゲームには流さない)
export const CODE_TO_UI_ACTION: Record<string, UIActionEvent | undefined> = {
    KeyA: { action: "UI_ONLY_SOMETHING1", type: "pressed" },
    KeyS: { action: "UI_ONLY_SOMETHING2", type: "pressed" },
};


