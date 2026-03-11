// src/renderer/screens/mainScreens/screen/controller/StartMessageScreenController.ts

import { MainScreenType, OverlayScreenType } from "../../../../../shared/type/screenType";
import { audioManager } from "../../../../../renderer/asset/audio/audioManager";
import { UIActionEvent } from "../../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../../../../renderer/screens/interface/context/ScreenInitContext";
import { MainScreenController } from "../../../../../renderer/screens/interface/controller/MainScreenController";

export class StartMessageScreenController implements MainScreenController {
    protected screenId: string = MainScreenType.START_MESSAGE

    private ctx!: ScreenInitContext;
    private el: HTMLElement | null = null;

    private slotId?: number;
    private playerName?: string;

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        console.log("[StartMessageScreen] init");

        this.ctx = initCtx;

        this.el = document.createElement("div");
        this.el.id = "startMessage";
        this.el.style.display = "none";
        root.appendChild(this.el);
    }

    show() {
        if (!this.el) return;
        this.el.style.display = "block";
    }

    hide() {
        if (this.el) this.el.style.display = "none";
    }

    UIActions(events: UIActionEvent[]): void {
        for (const e of events) {
            switch (e.action) {
                case "CONFIRM":
                    if (this.slotId === undefined) break;
                    audioManager.playSE("assets/se/decide.mp3");

                    if (this.playerName) {
                        // セーブあり → そのままゲーム開始
                        this.ctx.emitUI?.({
                            type: "START_GAME",
                            slotId: this.slotId,
                            playerName: this.playerName,
                        });
                    } else {
                        // 名前入力画面へ
                        this.ctx.emitUI?.({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.INPUT_NAME_OVERLAY, payload: undefined });
                    }
                    break;
                case "CANCEL":
                    audioManager.playSE("assets/se/cancel.mp3");
                    this.ctx.emitUI?.({ type: "EXIT_TO_SLOT_SELECT_MENU" });
            }
        }
    }
    /**
     * スロット情報に応じたメッセージ表示
     */
    showSlotMessage(slotId: number, hasSave: boolean, playerName?: string) {
        if (!this.el) return;

        console.log("[StartMessageScreen] showSlotMessage", {
            slotId,
            hasSave,
            playerName,
        });

        this.slotId = slotId;
        this.playerName = hasSave ? playerName : undefined;

        const mainMessage = hasSave && playerName
            ? `スロット ${slotId + 1} (${playerName}) で始めます`
            : `スロット ${slotId + 1} に新規作成します`;

        const helpMessage = hasSave
            ? `\nEnter : ゲーム開始\nEsc : スロット選択へ戻る`
            : `\nEnter : 名前入力へ\nEsc : スロット選択へ戻る`;

        this.el.textContent = mainMessage + helpMessage;
    }
}
