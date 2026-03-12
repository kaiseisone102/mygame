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
export const CommonAction = {
    CONFIRM: "CONFIRM", CANCEL: "CANCEL", INVENTORY: "INVENTORY", TEST_CHANGE_WORLD: "TEST_CHANGE_WORLD", TEST_OPEN_OPTION: "TEST_OPEN_OPTION", SHOW_SAND_STORM_OVERLAY: "SHOW_SAND_STORM_OVERLAY"
} as const;
export type CommonAction = typeof CommonAction[keyof typeof CommonAction];

// ゲーム専用アクション
// 共通アクションも含む
export const GameAction = {
    ATTACK: "ATTACK", JUMP: "JUMP"
} as const;
export type GameAction = | CommonAction | typeof GameAction[keyof typeof GameAction];

// UI専用アクション
// 共通アクションも含む
export const UIAction = {
    UI_ONLY_SOMETHING1: "UI_ONLY_SOMETHING1", UI_ONLY_SOMETHING2: "UI_ONLY_SOMETHING2"
} as const;
export type UIAction = | CommonAction | typeof UIAction[keyof typeof UIAction];

// アクションの種類 (押下/離上)
export const ActionType = {
    PRESSED: "PRESSED", RELEASED: "RELEASED"
} as const;
export type ActionType = typeof ActionType[keyof typeof ActionType];

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
    Enter: { action: CommonAction.CONFIRM, type: ActionType.PRESSED },
    Escape: { action: CommonAction.CANCEL, type: ActionType.PRESSED },
    Space: { action: CommonAction.INVENTORY, type: ActionType.PRESSED },
    KeyP: { action: CommonAction.TEST_CHANGE_WORLD, type: ActionType.PRESSED },
    KeyO: { action: CommonAction.TEST_OPEN_OPTION, type: ActionType.PRESSED },
    KeyS: { action: CommonAction.SHOW_SAND_STORM_OVERLAY, type: ActionType.PRESSED },
};

// GAME専用アクション (UIには流さない)
export const CODE_TO_GAME_ACTION: Record<string, GameActionEvent | undefined> = {
    KeyZ: { action: GameAction.ATTACK, type: ActionType.PRESSED },
    KeyX: { action: GameAction.JUMP, type: ActionType.PRESSED },
};

// UI専用アクション (ゲームには流さない)
export const CODE_TO_UI_ACTION: Record<string, UIActionEvent | undefined> = {
    KeyA: { action: UIAction.UI_ONLY_SOMETHING1, type: ActionType.PRESSED },
    KeyS: { action: UIAction.UI_ONLY_SOMETHING2, type: ActionType.PRESSED },
};


