// src/renderer/input/keyboard/action/GameActionSource.ts

import { GameAction, GameActionEvent } from "../../mapping/InputMapper";

/**
 * GameActionSource
 *
 * 役割:
 * - GAME向け Action 入力を管理する
 * - 押した瞬間のみ通知（Repeat / Hold はここではやらない）
 * - キー入力処理
 */
type GameActionListener = (event: GameActionEvent) => void;
// 生のキー情報 を ActionEvent に変換
export class GameActionSource {
    private listeners = new Set<(event: GameActionEvent) => void>;

    /** 
     * 購読 
     */
    on(fn: GameActionListener) {
        this.listeners.add(fn);
    }

    /** 
     * 購読解除 
     */
    off(fn: GameActionListener) {
        this.listeners.delete(fn);
    }

    /**
     * リスナー通知
     */
    emit(event: GameActionEvent) {
        this.listeners.forEach(fn => fn(event));
    }

    /**
     * ActionEvent を GAME 用に流す
     */
    handleAction(ev: GameActionEvent) {
        
        // GameAction かどうか型チェック
        if (!this.isGameAction(ev.action)) return;

        // GAME リスナーに通知
        this.emit({ action: ev.action, type: ev.type });
    }

    /**
     * Action が GameAction かどうか判定
     */
    private isGameAction(action: GameAction): action is GameAction {
        // 共通 Action + ゲーム専用 Action かをチェック
        const gameActions: GameAction[] = ["CONFIRM", "CANCEL", "INVENTORY", "ATTACK", "JUMP"];
        return gameActions.includes(action as GameAction);
    }

    /**
     * 全購読解除
     */
    clear() {
        this.listeners.clear();
    }
}