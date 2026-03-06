// src/renderer/input/keyboard/axis/UIAxisSource.ts
import { InputAxis } from "../../mapping/InputMapper";
import { AxisSource } from "./AxisSource";

type AxisHandler = (axis: InputAxis, pressed: boolean) => void;

interface RepeaterConfig {
    initialDelay?: number;
    repeatInterval?: number;
}

/**
 * UIAxisSource
 *
 * 役割:
 * - InputAxis を受け取り、そのまま UI に通知
 * - Repeater 機能内蔵で長押しに対応
 */
export class UIAxisSource implements AxisSource {
    private handlers = new Set<AxisHandler>();
    private holding = new Set<InputAxis>();
    private timers = new Map<InputAxis, number>();
    private config?: Required<RepeaterConfig>;

    constructor(config?: RepeaterConfig) {
        this.config = {
            initialDelay: config?.initialDelay ?? 300,  // 最初の遅延 500ms
            repeatInterval: config?.repeatInterval ?? 50, // 連打間隔 50ms
        };
    }

    /** ハンドラ登録 */
    on(handler: AxisHandler) {
        this.handlers.add(handler);
    }

    /** ハンドラ削除 */
    off(handler: AxisHandler) {
        this.handlers.delete(handler);
    }

    /**
     * Axis の押下 / 解放をそのまま流す
     */
    emit(axis: InputAxis, pressed: boolean) {
        // console.log("[UIAxisSource] emit", axis, pressed);
        if (pressed) {
            if (this.holding.has(axis)) return; // すでに押下中は無視
            this.holding.add(axis);

            // 押下直後に通知
            this.notify(axis);

            // 初期遅延後に連打開始
            const id = window.setTimeout(() => this.repeat(axis), this.config?.initialDelay);
            this.timers.set(axis, id);
        } else {
            this.holding.delete(axis);
            const id = this.timers.get(axis);
            if (id !== undefined) window.clearTimeout(id);
            this.timers.delete(axis);
        }
    }
    private repeat(axis: InputAxis) {
        if (!this.holding.has(axis)) return;
        this.notify(axis);
        const id = window.setTimeout(() => this.repeat(axis), this.config?.repeatInterval);
        this.timers.set(axis, id);
    }

    private notify(axis: InputAxis) {
        for (const h of this.handlers) {
            h(axis, true);
        }
    }

    /** 強制リセット（画面切替用） */
    reset() {
        for (const id of this.timers.values()) window.clearTimeout(id);
        this.timers.clear();
        this.holding.clear();
    }
}
