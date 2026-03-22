// src/renderer/screens/mainScreens/screen/controller/SlotSelectOverlayController.ts

import { BaseScreenController } from "../../../../../renderer/screens/interface/controller/BaseScreenController";
import { GameConfig } from "../../../../../shared/config/GameConfig";
import { WorldQueryAsyncEvent } from "../../../../../shared/events/world/WorldQuerryEvent";
import { OverlayScreenType } from "../../../../../shared/type/screenType";
import { audioManager } from "../../../../asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "../../../../input/mapping/InputMapper";
import { AppUIEvent } from "../../../../router/AppUIEvents";
import { ScreenInitContext } from "../../../interface/context/ScreenInitContext";
import { SlotViewModel } from "../../../viewModel/SlotViewModel";

export class SlotSelectOverlayController implements BaseScreenController<void> {

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

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.emitUI = initCtx.emitUI;
        this.queryAsync = initCtx.queryAsync;

        this.screen = this.createScreen();
        root.appendChild(this.screen);

        this.cursor = this.createCursor();
        this.screen.appendChild(this.cursor);

        this.slotElements = Array.from(this.screen.querySelectorAll(".slot")) as HTMLElement[];

        this.setSelectedSlot(this.selectedSlotId);
    }

    async show(payload: undefined) {
        this.screen.style.display = "block";
        await this.refreshSlots();
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
                    console.log("[SlotSelectScreen] CONFIRM slot", this.selectedSlotId + 1);
                    audioManager.playSE("assets/se/decide.mp3");

                    const slotView = await this.queryAsync({
                        type: "GET_SLOT_VIEW",
                        slotId: this.selectedSlotId + 1,
                    }) as SlotViewModel;

                    if (slotView.isEmpty) {
                        // 新規
                        this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.INPUT_NAME_OVERLAY, payload: { slotId: slotView.id } });
                    } else {
                        // 既存
                        this.emitUI({ type: "START_GAME", slotId: slotView.id, playerName: slotView.playerName, });
                    }
                    break;

                case "CANCEL":
                    audioManager.playSE("assets/se/cancel.mp3");
                    this.emitUI({ type: "POP_OVERLAY" });
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

        // 1. Vertical (Top): スロットのTop位置に合わせる 
        // (スロットの高さの中央に合わせる場合は + rect.height/2 - cursor.height/2)
        const topPos = rect.top - screenRect.top + (rect.height / 2) - (this.cursor.height / 2);

        // 2. Horizontal (Left): スロットの左端から、カーソル幅分だけ左に離す
        // (-10px ほど調整して少し食い込ませるのがペルソナ風)
        const leftPos = rect.left - screenRect.left - this.cursor.width + 10;

        this.cursor.style.top = `${topPos}px`;
        this.cursor.style.left = `${leftPos}px`;
    }

    /* ===================== DOM ===================== */

    private createScreen(): HTMLElement {
        this.screen = document.createElement("div");
        this.screen.id = "slotSelectScreen";

        const slotsBorder = document.createElement("div");
        slotsBorder.id = "slotsBorder";
        this.screen.appendChild(slotsBorder);

        for (let i = 1; i <= this.SLOT_COUNT; i++) {
            const slot = document.createElement("div");
            slot.classList.add("slot");
            slot.id = `slot${i}`;

            slot.textContent = "---";

            slotsBorder.appendChild(slot);
        }

        return this.screen;
    }

    private async refreshSlots() {
        // 3つのスロットを並列で取得
        const promises = [1, 2, 3].map(id =>
            this.queryAsync({ type: "GET_SLOT_VIEW", slotId: id }) as Promise<SlotViewModel>
        );

        const results = await Promise.all(promises);

        // DOMへの反映
        results.forEach((slotView, idx) => {
            const el = this.slotElements[idx];
            if (!el) return;

            el.textContent = slotView.label;
            el.classList.toggle("empty", slotView.isEmpty);
        });

        // カーソルの再計算が必要ならフラグを立てる
        this.cursorDirty = true;
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
