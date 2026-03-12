// src/renderer/input/keyboard/InputManager.ts
import { ActionType, CODE_TO_AXIS, CODE_TO_COMMON_ACTION, CODE_TO_GAME_ACTION, CODE_TO_UI_ACTION } from "../mapping/InputMapper";
import { InputState } from "../state/InputState";
import { RawKeyboardSource } from "./RawKeyboardSource";
import { GameActionSource } from "./action/GameActionSource";
import { UIActionSource } from "./action/UIActionSource";
import { AxisEventQueue } from "./axis/AxisEventQueue";
import { GameAxisSource } from "./axis/GameAxisSource";
import { UIAxisSource } from "./axis/UIAxisSource";
import { TextInputSource } from "./textInput/TextInputSource";

/**
 * InputManager
 *
 * 役割:
 * - RawKeyboardSource から受け取った「生キー入力」を
 *   UI / GAME 用の Axis / Action に振り分けるハブ
 *
 * 特徴:
 * - UI と GAME の入力を同時に生成する
 * - 実際に「使うかどうか」は Screen / Context 側で判断する
 *
 * 注意点:
 * - 状態を持つクラス（Repeater / Axis / Action）が多く、
 *   更新順(update)とイベント順(on)がズレるとバグりやすい
 */
export class InputManager {
    readonly raw = new RawKeyboardSource();

    // テキスト入力
    readonly textInput = new TextInputSource();

    // AXIS
    readonly uiAxisSource = new UIAxisSource({ initialDelay: 300, repeatInterval: 150 }); // 押下 / 解放 UI用 連打
    readonly gameAxis = new GameAxisSource();  // ゲーム用 連打

    // ACTION
    readonly uiAction = new UIActionSource(); // 単発保証で
    readonly gameAction = new GameActionSource(); // 単発保証でOK

    private axisQueue!: AxisEventQueue;

    constructor(inputState: InputState, axisQueue: AxisEventQueue) {
        console.log("[InputManager] initialized");
        this.axisQueue = axisQueue;

        // UIAxisSource の連打を購読して AxisEventQueue に流す
        this.uiAxisSource.on((axis, pressed) => {
            inputState.setAxis(axis, pressed); // optional: InputState 更新
            this.axisQueue.push({
                axis,
                pressed,
                timestamp: performance.now(),
                target: "UI",
            });
        });


        // GameAxisSource の emit を購読して AxisEventQueue に流す
        this.gameAxis.on((axis, pressed) => {
            this.axisQueue.push({
                axis,
                pressed,
                timestamp: performance.now(),
                target: "GAME",
            });
        });

        // 生キー入力
        this.raw.on((code, pressed) => {
            const type = pressed ? ActionType.PRESSED : ActionType.RELEASED;

            const axis = CODE_TO_AXIS[code];
            if (axis) {
                inputState.setAxis(axis, pressed);
                this.uiAxisSource.emit(axis, pressed);
                this.gameAxis.emit(axis, pressed);
            }

            if (!pressed) return;

            // Text input (UI専用)
            if (pressed) {
                const char = this.codeToChar(code);
                if (char) {
                    this.textInput.emit(char);
                }
            }

            // Action
            const common = CODE_TO_COMMON_ACTION[code];
            if (common) inputState.pushCommonAction({ action: common.action, type });

            const game = CODE_TO_GAME_ACTION[code];
            if (game) inputState.pushGameAction({ action: game.action, type });

            const ui = CODE_TO_UI_ACTION[code];
            if (ui) inputState.pushUIAction({ action: ui.action, type });
        });
    }

    private codeToChar(code: string): string | null {
        if (code.startsWith("Key")) {
            return code.replace("Key", "").toLowerCase();
        }

        if (code === "Backspace") return "BACKSPACE";
        if (code === "Space") return " ";

        return null;
    }
}
