// src/renderer/screens/overlayScreens/screen/controller/InventoryOverlayController.ts

import { InputAxis, UIActionEvent } from "../../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { ScreenInitContext } from "../../../../../renderer/screens/interface/context/ScreenInitContext";
import { UIScreenController } from "../../../../../renderer/screens/interface/controller/UIScreenController";

export class InventoryOverlayController implements UIScreenController {
    private screen!: HTMLElement;
    private emitUI?: (event: AppUIEvent) => void;
    private ctx!: ScreenInitContext;

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.ctx = initCtx
        this.emitUI = this.ctx.emitUI;

        // --------------------
        // DOM構築
        // --------------------
        this.screen = document.createElement("div");
        this.screen.id = "itemOverlay";
        this.screen.style.position = "absolute";
        this.screen.style.inset = "0";
        this.screen.style.background = "rgba(0,0,0,0.7)";
        this.screen.style.color = "white";
        this.screen.innerText = "ItemOverlay";

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
                    this.emitUI?.({ type: "SELECT" });
                    break;
                case "CANCEL":
                    this.emitUI?.({ type: "POP_OVERLAY" });
                    break;
                case "INVENTORY":
                    this.emitUI?.({ type: "POP_OVERLAY" });
                    break;
            }
        }
    }
}