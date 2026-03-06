// src/renderer/input/InputSystem.ts
import { InputState } from "./state/InputState";
import { InputIntentResolver } from "./intent/InputIntentResolver";
import type { InputFrame } from "./frame/InputFrame";
import { AxisEventQueue } from "./keyboard/axis/AxisEventQueue";
import { InputManager } from "./keyboard/InputManager";

export class InputSystem {
    private textInputEnabled = false;

    private resolver: InputIntentResolver;

    private textBuffer: string[] = [];

    constructor(
        private state: InputState,
        private axisQueue: AxisEventQueue,
        inputManager: InputManager
    ) {
        this.resolver = new InputIntentResolver(state);

        inputManager.textInput.on(char => {
            if (this.textInputEnabled) {
                this.textBuffer.push(char);
            }
        });
    }

    // ==============================
    // モード制御API
    // ==============================

    enableTextInput() {
        this.textInputEnabled = true;
    }

    disableTextInput() {
        this.textInputEnabled = false;
        this.textBuffer.length = 0;
    }

    isTextInputEnabled() {
        return this.textInputEnabled;
    }

    // ==============================
    // 通常フロー
    // ==============================

    /**
     * 1フレーム分の入力を生成
     */
    pollFrame(): InputFrame {
        const axisEvents = this.axisQueue.consume(); // Queue から取得

        // UI / GAME に振り分け
        const uiAxisIntents = axisEvents
            .filter(e => e.target === "UI" || e.target === "BOTH")
            .map(e => e.axis);

        axisEvents
            .filter(e => e.target === "GAME" || e.target === "BOTH")
            .forEach(e => this.state.setAxis(e.axis, e.pressed));

        return {
            uiActions: this.state.consumeUIActions(),
            uiAxisIntents,
            gameActions: this.state.consumeGameActions(),
            gameAxisIntents: this.resolver.resolveGameAxisIntents(),
        };
    }

    consumeTextInput(): string[] {
        if (!this.textInputEnabled) return [];

        const copy = [...this.textBuffer];
        if (copy.length > 0) {
            console.log("TEXT:", copy);
        }
        this.textBuffer.length = 0;
        return copy;
    }

    reset() {
        this.state.reset();
        this.textBuffer.length = 0;
        this.textInputEnabled = false;
    }
}
