// src/renderer/screens/mainScreens/controller/InputNameOverlayController.ts

import { InputAxis, UIActionEvent } from "../../../../input/mapping/InputMapper";
import { AppUIEvent } from "../../../../router/AppUIEvents";
import { ScreenInitContext } from "../../../interface/context/ScreenInitContext";
import { UIScreenController } from "../../../interface/controller/UIScreenController";
import { WorldEvent } from "../../../../router/WorldEvent";
import { DEFAULT_PLAYER_NAME } from "../../../../../shared/data/playerConstants";

export class InputNameOverlayController implements UIScreenController {

    private container!: HTMLElement;
    private display!: HTMLElement;

    private emitUI!: (event: AppUIEvent) => void;
    private emitWorld!: (event: WorldEvent) => void;
    private ctx!: ScreenInitContext;

    private name: string = "";
    private maxLength = 12;
    private popTimer: number | null = null;

    private cursorIndex = 0;

    private slotId!: number;

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.emitUI = initCtx.emitUI;
        this.emitWorld = initCtx.emitWorld;
        this.ctx = initCtx;

        // --------------------
        // DOM構築
        // --------------------
        this.container = document.createElement("div");
        this.container.className = "name-input-container";

        this.display = document.createElement("div");
        this.display.className = "name-input-display";

        this.container.appendChild(this.display);
        root.appendChild(this.container);

        this.updateDisplay();
    }

    show() {
        this.container.style.display = "block";
    }

    hide() {
        this.container.style.display = "none";
    }

    UIAxes(axes: InputAxis[]): void {

    }

    handleTextInput(chars: string[]) {
        console.log("NAME INPUT RECEIVED:", chars);
        for (const char of chars) {
            if (char === "BACKSPACE") {
                if (this.cursorIndex > 0) {
                    this.name =
                        this.name.slice(0, this.cursorIndex - 1) +
                        this.name.slice(this.cursorIndex);
                    this.cursorIndex--;
                }
                continue;
            }

            if (this.name.length >= this.maxLength) continue;

            this.name = this.name.slice(0, this.cursorIndex) + char + this.name.slice(this.cursorIndex);

            this.cursorIndex++;
        }

        this.updateDisplay();
    }

    UIActions(events: UIActionEvent[]) {
        for (const e of events) {

            switch (e.action) {
                case "CONFIRM": {
                    const name = this.name.trim();
                    const slotId = this.slotId;
                    if (slotId === null) throw new Error("[InputNameOverlay] can't found slotId");
                    // 入力後　確認 (はい、いいえのoverlay)
                    this.emitUI({
                        type: "OPEN_YES_NO",
                        message: `データ${slotId}の「${name || DEFAULT_PLAYER_NAME}」で始めますか?`,
                        onYes: () => {
                            this.emitUI({
                                type: "START_GAME",
                                slotId: slotId,
                                playerName: name,
                            });
                            this.emitUI({ type: "POP_OVERLAY" });
                        },
                        onNo: () => this.emitUI({ type: "POP_OVERLAY" })
                    });
                    break;
                }

                case "CANCEL":
                    // 本当に戻るか　確認 (overlay)
                    this.emitUI({
                        type: "OPEN_YES_NO",
                        message: "名前入力をやめますか？",
                        onYes: () => this.emitUI({ type: "GO_SLOT_SELECT" }),
                        onNo: () => this.emitUI({ type: "POP_OVERLAY" }),
                    });
                    break;
            }
        }
    }

    private updateDisplay() {
        const before = this.name.slice(0, this.cursorIndex);
        const after = this.name.slice(this.cursorIndex);

        this.display.innerHTML = `
        <span>${before}</span>
        <span class="cursor"></span>
        <span>${after}</span>
    `;

        this.display.classList.add("pop");

        if (this.popTimer !== null) {
            clearTimeout(this.popTimer);
        }

        this.popTimer = window.setTimeout(() => {
            this.display.classList.remove("pop");
            this.popTimer = null;
        }, 100);
    }

    setSlotId(id: number) {
        this.slotId = id;
    }

}