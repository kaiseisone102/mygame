// src/renderer/screens/mainScreens/screen/FieldCommandOverlay.ts

import { audioManager } from "../../../../renderer/asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../renderer/router/WorldEvent";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { FIELD_COMMANDS_DISPLAY } from "../../../../shared/data/constants";
import { FieldActionType } from "../../../../shared/type/field/FieldActionType";
import { OverlayScreenType } from "../../../../shared/type/screenType";

export class FieldCommandOverlay implements OverlayScreen<void> {
    readonly overlayId: string = OverlayScreenType.FIELD_COMMAND;
    readonly capturesInput: boolean = true;

    private screen!: HTMLElement;
    private container!: HTMLElement;
    private commandItems: HTMLParagraphElement[] = [];

    private selectedIndex = 0;
    private lastIndex = 0;

    private emitWorld!: (event: WorldEvent) => void;
    private emitUI!: (event: AppUIEvent) => void;

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        console.log("[FieldCommandOverlay] init");

        this.emitWorld = initCtx.emitWorld
        this.emitUI = initCtx.emitUI;

        // 画面全体
        this.screen = document.createElement("div");
        this.screen.id = "field-command-overlay";
        this.screen.className = "overlay-base"; // 共通クラス
        root.appendChild(this.screen);

        // 枠
        this.container = document.createElement("div");
        this.container.id = "container";
        this.container.className = "dq-window";
        this.screen.appendChild(this.container);

        // コマンド生成
        FIELD_COMMANDS_DISPLAY.forEach((cmd, index) => {
            const p = document.createElement("p");
            p.textContent = cmd.label;

            this.container.appendChild(p);
            this.commandItems.push(p);
        });

        this.updateCommandUI();
        this.hide();
    };

    show(payload: void): void {
        this.screen.style.display = "block";

        this.selectedIndex = 0;
        this.updateCommandUI();
    }

    hide(): void {
        this.screen.style.display = "none";
    }

    update(delta: number): void { }

    pause(): void { }

    resume(): void { }

    handleUIActions(actions: UIActionEvent[]): boolean {
        for (const a of actions) {
            switch (a.action) {
                case "CONFIRM": {
                    audioManager.playSE("assets/se/decide.mp3");

                    const commandId = FIELD_COMMANDS_DISPLAY[this.selectedIndex].id;

                    switch (commandId) {
                        case FieldActionType.ITEM:
                        case FieldActionType.MAGIC:
                            break;

                        case FieldActionType.EQUIPMENT:
                            break;

                        case FieldActionType.SAVE:
                            this.emitUI({ type: "SAVE_GAME" });
                            break;

                        case FieldActionType.OPTION:
                            this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.OPTIONS, payload: undefined });
                            break;
                    }
                    return true;
                }
                case "CANCEL":
                    audioManager.playSE("assets/se/cancel.mp3");
                    this.emitUI({ type: "POP_OVERLAY" });
                    return true;
            }
        }
        return true; // UI入力は常に消費
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        for (const axis of axes) {

            switch (axis) {

                case "UP":
                case "LEFT":
                    this.selectedIndex = (this.selectedIndex - 1 + this.commandItems.length) % this.commandItems.length;
                    break;

                case "DOWN":
                case "RIGHT":
                    this.selectedIndex = (this.selectedIndex + 1) % this.commandItems.length;
                    break;
            }
        }
        // インデックスが変わったときだけSEを鳴らす
        if (this.lastIndex !== this.selectedIndex) {
            audioManager.playSE("assets/se/cursorMove.mp3");
            this.updateCommandUI();
        }

        this.lastIndex = this.selectedIndex;

        this.updateCommandUI();
        return true;
    };

    private updateCommandUI() {
        this.commandItems.forEach((el, i) => {
            el.classList.toggle("selected", i === this.selectedIndex);
        });
    }
}