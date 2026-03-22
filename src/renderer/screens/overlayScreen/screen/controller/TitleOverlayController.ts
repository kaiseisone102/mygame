// src/renderer/screens/mainScreen/screen/TitleOverlayController.ts

import { OverlayScreenType } from "../../../../../shared/type/screenType";
import { audioManager } from "../../../../asset/audio/audioManager";
import { CommonAction, UIActionEvent } from "../../../../input/mapping/InputMapper";
import { AppUIEvent } from "../../../../router/AppUIEvents";
import { ScreenInitContext } from "../../../interface/context/ScreenInitContext";
import { blinkText } from "../../../../utils/blinkLoop";
import { ImageStore } from "../../../../asset/ImageStore";
import { ImageKey } from "../../../../../shared/type/ImageKey";
import { BaseScreenController } from "../../../../../renderer/screens/interface/controller/BaseScreenController";

export class TitleOverlayController implements BaseScreenController<void> {

    private screen!: HTMLElement;
    private title!: HTMLElement;
    private pressEnter!: HTMLElement;
    private right!: HTMLElement;

    private titleText!: HTMLImageElement;

    /** PRESS ENTER の点滅制御 */
    private blinkCtrl?: AbortController;

    /** WorldEvent 発行関数 */
    private emitUI!: (event: AppUIEvent) => void;

    constructor() { }

    /**
     * 画面初期化
     */
    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.emitUI = initCtx.emitUI;

        // 画面全体
        this.screen = document.createElement("div");
        this.screen.id = "titleScreen";
        root.appendChild(this.screen);

        // タイトル文字
        this.title = document.createElement("div");
        this.title.id = "title";
        this.titleText = ImageStore.get(ImageKey.TITLE_TEXT);
        this.title.appendChild(this.titleText);

        // PRESS ENTER 表示
        this.pressEnter = document.createElement("div");
        this.pressEnter.id = "pressEnterKey";
        this.pressEnter.textContent = "PRESS ENTER KEY";

        // 権利表記など
        this.right = document.createElement("div");
        this.right.id = "right";
        this.right.textContent = "NantyatteProduct";

        this.screen.append(this.title, this.pressEnter, this.right);
    }

    show(payload: void) {
        this.screen.style.display = "block";

        // 点滅アニメーション開始（多重起動防止）
        this.blinkCtrl?.abort();
        this.blinkCtrl = blinkText(this.pressEnter);
    }

    hide() {
        this.screen.style.display = "none";

        // 点滅停止
        this.blinkCtrl?.abort();
        this.blinkCtrl = undefined;
    }

    UIActions(events: UIActionEvent[]): void {
        for (const e of events) {

            switch (e.action) {
                case CommonAction.CONFIRM:
                    audioManager.playSE("assets/se/decide.mp3");
                    this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.SLOT_SELECT, payload: undefined });
                    break;

                case CommonAction.CANCEL:
                    audioManager.playSE("assets/se/cancel.mp3");
                    this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.OPTIONS, payload: undefined });
                    break;
            }
        }
    }
}
