// src/renderer/screens/mainScreens/screen/controller/SlotSelectScreenController.ts

import { WorldQueryAsyncEvent } from "../../../../../shared/events/world/WorldQuerryEvent";
import { audioManager } from "../../../../../renderer/asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "../../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { ScreenInitContext } from "../../../../../renderer/screens/interface/context/ScreenInitContext";
import { MainScreenController } from "../../../../../renderer/screens/interface/controller/MainScreenController";
import { UseUIAxesScreenController } from "../../../../../renderer/screens/interface/controller/UseUIAxesScreenController";
import { SlotViewModel } from "../../../../../renderer/screens/viewModel/SlotViewModel";
import { GameConfig } from "../../../../../shared/config/GameConfig";

export class SlotSelectScreenController implements MainScreenController, UseUIAxesScreenController {
    private screen!: HTMLElement;
    private emitUI!: (event: AppUIEvent) => void;
    private queryAsync!: (event: WorldQueryAsyncEvent) => Promise<SlotViewModel | GameConfig>;
    /** 現在選択中のスロット */
    private selectedSlotId: number = 0;
    private readonly SLOT_COUNT: number = 3;

    /** スロット DOM */
    private slotElements: HTMLElement[] = [];
    /** カーソル */
    private cursor: HTMLImageElement | null = null;
    /** カーソルアニメーション管理 */
    private cursorTimer: number | null = null;
    private cursorDirty: boolean = true;

    /** リサイズ時はカーソル再計算 */
    private onResize = () => { this.cursorDirty = true };

    async init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.emitUI = initCtx.emitUI;
        this.queryAsync = initCtx.queryAsync;

        this.screen = await this.createScreen();
        root.appendChild(this.screen);

        this.cursor = this.createCursor();
        this.screen.appendChild(this.cursor);

        this.slotElements = Array.from(this.screen.querySelectorAll(".slot")) as HTMLElement[];

        this.setSelectedSlot(this.selectedSlotId);
    }

    show() {
        this.screen.style.display = "block";
        this.refreshSlots();
        this.setSelectedSlot(this.selectedSlotId);

        this.cursorDirty = true;
        this.startCursorAnimation();
        window.addEventListener("resize", this.onResize);
    }

    hide() {
        this.screen.style.display = "none";
        this.stopCursorAnimation();
        window.removeEventListener("resize", this.onResize);
    }

    update(delta: number) {
        if (!this.cursorDirty) return;
        this.updateCursorPosition();
        this.cursorDirty = false;
    }

    UIAxes(axes: InputAxis[]) {
        for (const axis of axes) {
            switch (axis) {
                case "UP":
                case "LEFT": this.move(-1); break;
                case "DOWN":
                case "RIGHT": this.move(1); break;
            }
            audioManager.playSE("assets/se/cursorMove.mp3");
        }
    }

    async UIActions(events: UIActionEvent[]) {
        for (const e of events) {
            switch (e.action) {
                case "CONFIRM":
                    console.log("[SlotSelectScreen] CONFIRM slot", this.selectedSlotId);
                    audioManager.playSE("assets/se/decide.mp3");

                    const slotView = await this.queryAsync({
                        type: "GET_SLOT_VIEW",
                        slotId: this.selectedSlotId + 1,
                    }) as SlotViewModel;
                    if (slotView.isEmpty) {
                        // 新規
                        this.emitUI({
                            type: "SHOW_INPUT_NAME_OVERLAY",
                            slotId: slotView.id,
                        });
                    } else {
                        // 既存
                        this.emitUI({
                            type: "START_GAME",
                            slotId: slotView.id,
                            playerName: slotView.playerName,
                        });
                    }
                    break;

                case "CANCEL":
                    console.log("[SlotSelectScreen] CANCEL → EXIT_TO_TITLE");
                    audioManager.playSE("assets/se/cancel.mp3");
                    this.emitUI?.({ type: "EXIT_TO_TITLE" });
                    break;
            }
        }
    }

    /* =====================
    Slot Logic
    ===================== */

    /**
     * スロット移動
     */
    private move(delta: number) {
        const count = this.slotElements.length;
        const prev = this.selectedSlotId;
        this.selectedSlotId = (this.selectedSlotId + delta + count) % count;

        console.log(
            "[SlotSelectScreen] move",
            `${prev} → ${this.selectedSlotId}`
        );

        this.setSelectedSlot(this.selectedSlotId);
    }

    /**
     * 選択中スロットの更新
     */
    private setSelectedSlot(slotId: number) {
        if (!this.slotElements.length) return;
        this.slotElements.forEach(el => el.classList.remove("selected"));
        this.slotElements[slotId].classList.add("selected");
        this.selectedSlotId = slotId;
        this.cursorDirty = true;
    }

    /**
     * カーソル位置更新
     */
    private updateCursorPosition() {
        if (!this.cursor || !this.slotElements.length) return;

        const target = this.slotElements[this.selectedSlotId];
        const rect = target.getBoundingClientRect();
        const screenRect = this.screen.getBoundingClientRect();

        this.cursor.style.top = `${rect.top - screenRect.top + rect.height + this.cursor.height / 16}px`;
        this.cursor.style.left = `${rect.left - screenRect.left - this.cursor.width}px`;
    }

    /* ===================== DOM ===================== */

    private async createScreen(): Promise<HTMLElement> {
        this.screen = document.createElement("div");
        this.screen.id = "slotSelectScreen";

        const slotsBorder = document.createElement("div");
        slotsBorder.id = "slotsBorder";
        this.screen.appendChild(slotsBorder);

        for (let i = 1; i <= this.SLOT_COUNT; i++) {
            const slot = document.createElement("div");
            slot.classList.add("slot");
            slot.id = `slot${i}`;

            const slotViewRaw = this.queryAsync({
                type: "GET_SLOT_VIEW",
                slotId: i,
            });

            // const slotView: SlotViewModel = (slotViewRaw && 'label' in (slotViewRaw as any))
            //     ? (slotViewRaw as SlotViewModel)
            //     : { id: i, label: "空きスロット", isEmpty: true };
            const slotView = await this.queryAsync({
                type: "GET_SLOT_VIEW",
                slotId: i,
            }) as SlotViewModel;
            slot.textContent = slotView.label;
            slot.classList.toggle("empty", slotView.isEmpty);

            slotsBorder.appendChild(slot);
        }

        return this.screen;
    }

    private refreshSlots() {
        this.slotElements.forEach((el, idx) => {
            const slotViewRaw = this.queryAsync({
                type: "GET_SLOT_VIEW",
                slotId: idx + 1,
            });

            const slotView: SlotViewModel = (slotViewRaw && 'label' in (slotViewRaw as any))
                ? (slotViewRaw as unknown as SlotViewModel)
                : { id: idx + 1, label: "空きスロット", isEmpty: true };

            el.textContent = slotView.label;
            el.classList.toggle("empty", slotView.isEmpty);
        });
    }

    private createCursor(): HTMLImageElement {
        const img = document.createElement("img");
        img.classList.add("slotCursor");
        img.src = "assets/cursor/cursor1.png";
        return img;
    }

    /* ===================== Cursor Animation ===================== */

    private startCursorAnimation() {
        console.log("[SlotSelectScreen] startCursorAnimation");

        const FRAMES = ["cursor1.png", "cursor2.png", "cursor3.png", "cursor2.png", "cursor1.png", "cursor2.png", "cursor4.png", "cursor2.png",]
            .map(f => `assets/cursor/${f}`);

        let index = 0;
        this.stopCursorAnimation();

        this.cursorTimer = window.setInterval(() => {
            index = (index + 1) % FRAMES.length;
            this.cursor!.src = FRAMES[index];
        }, 300);
    }

    private stopCursorAnimation() {
        if (this.cursorTimer !== null) {
            console.log("[SlotSelectScreen] stopCursorAnimation");
            clearInterval(this.cursorTimer);
            this.cursorTimer = null;
        }
    }
}
