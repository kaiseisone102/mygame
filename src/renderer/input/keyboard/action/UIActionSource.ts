// src/renderer/input/keyboard/action/UIActionSource.ts
import { UIAction, UIActionEvent } from "../../mapping/InputMapper";

/**
 * UIActionSource
 *
 * 役割:
 * - UI向けの Action 入力を管理する
 * - 押した瞬間のみを通知（Repeat / Hold なし）
 * - キー入力処理
 */
type UIActionListener = (event: UIActionEvent) => void;
// 生のキー情報 を ActionEvent に変換
export class UIActionSource {
    /** ActionEvent を受け取る購読者 */
    private listeners = new Set<(UIActionListener)>();
    /** 押下中の Action を保持（連打抑制用） */
    private holding = new Set<UIAction>();

    /**
     * ActionEvent の購読
     */
    on(fn: (UIActionListener)) {
        this.listeners.add(fn);
    }

    /**
     * ActionEvent の購読解除
     */
    off(fn: (UIActionListener)) {
        this.listeners.delete(fn);
    }

    /**
     * UIActionEvent を購読者へ通知
     */
    emit(event: UIActionEvent) {
        this.listeners.forEach(fn => fn(event));
    }

    /**
     * 共通 Action を UIAction に変換して流す
     */
    handleAction(ev: UIActionEvent) {
        const action = ev.action as UIAction;

        // 押された瞬間のみ通知
        if (ev.type === "pressed") {
            // すでに押されていたら無視
            if (this.holding.has(action)) return;
            this.holding.add(action);
            this.emit({ action, type: ev.type });
        } else {
            // released は無視するけど holding からは削除して次回押下を受け付ける
            this.holding.delete(action);
        }
    }

    /**
     * 全購読解除（画面切り替え用）
     */
    clear() {
        this.listeners.clear();
    }
}
