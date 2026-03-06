// src/renderer/screens/battleScreens/overlayScreen/controller/BattleLogOverlayController.ts

import { InputAxis, UIActionEvent } from "../../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { ScreenInitContext } from "../../../../../renderer/screens/interface/context/ScreenInitContext";
import { UIScreenController } from "../../../../../renderer/screens/interface/controller/UIScreenController";
import { BATTLE_LOG_TYPE_SPEED } from "../../../../../shared/data/constants";

export class BattleLogOverlayController implements UIScreenController {
    private screen!: HTMLElement;
    private logContainer!: HTMLElement;
    private emitUI?: (event: AppUIEvent) => void;
    private ctx!: ScreenInitContext;

    private logs: string[] = [];

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.ctx = initCtx
        this.emitUI = this.ctx.emitUI;

        // --------------------
        // 外枠
        // --------------------
        this.screen = document.createElement("div");
        this.screen.id = "battleLogOverlay";

        // --------------------
        // ログ表示領域
        // --------------------
        this.logContainer = document.createElement("div");
        this.logContainer.id = "battleLogContainer";

        this.screen.appendChild(this.logContainer);

        root.appendChild(this.screen);
    }

    show(): void {
        this.screen.style.display = "block";
    }

    hide(): void {
        this.screen.style.display = "none";
    }

    update(delta: number): void {

    }

    UIAxis(axes: InputAxis[]): void {
        for (const axis of axes) {

            switch (axis) {
                case "UP":
                    break;
                case "DOWN":
                    break;
                case "LEFT":
                    break;
                case "RIGHT":
                    break;
            }
        }
    }

    UIActions(events: UIActionEvent[]): void {
        for (const e of events) {
            switch (e.action) {
                case "CONFIRM":
                case "CANCEL":
                case "INVENTORY":
                    this.emitUI?.({ type: "SEND_MESSAGE" });
                    break;
            }
        }
    }

    /**
     * ログ追加
     */
    addLog(message: string, speed = BATTLE_LOG_TYPE_SPEED) {
        console.log("[BattleLog] addLog", message);

        let typingIndex = 0;
        const p = document.createElement("p");
        p.style.margin = "2px 0";
        this.logContainer.appendChild(p);

        const interval = setInterval(() => {
            p.textContent += message[typingIndex];
            typingIndex++;

            // 最大ログ件数制限（4件）
            while (this.logContainer.children.length > 4) {
                this.logContainer.removeChild(this.logContainer.firstChild!);
            }

            if (typingIndex >= message.length) {
                clearInterval(interval);
            }
        }, speed);
    }

    /**
     * ログクリア
     */
    clearLogs() {
        this.logs = [];
        this.logContainer.innerHTML = "";
    }
}