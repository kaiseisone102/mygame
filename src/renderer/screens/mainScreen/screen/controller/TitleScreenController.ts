// src/renderer/screens/mainScreen/screen/TitleScreen.ts

import { OverlayScreenType } from "../../../../../shared/type/screenType";
import { audioManager } from "../../../../../renderer/asset/audio/audioManager";
import { CommonAction, UIActionEvent } from "../../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { ScreenInitContext } from "../../../../../renderer/screens/interface/context/ScreenInitContext";
import { MainScreenController } from "../../../../../renderer/screens/interface/controller/MainScreenController";
import { blinkText } from "../../../../../renderer/utils/blinkLoop";

export class TitleScreenController implements MainScreenController {
    private screen!: HTMLElement;
    private title!: HTMLElement;
    private pressEnter!: HTMLElement;
    private right!: HTMLElement;

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
        this.title.textContent = "DNATOKAQUAE";

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

    show() {
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
                    this.emitUI?.({ type: "GO_SLOT_SELECT" });
                    break;

                case CommonAction.SHOW_SAND_STORM_OVERLAY:
                    this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.SANDSTORMOVERLAY, payload: undefined })
                    break;

                case CommonAction.CANCEL:
                    audioManager.playSE("assets/se/cancel.mp3");
                    this.emitUI?.({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.OPTIONS, payload: undefined })
                    break;
            }
        }
    }
}
