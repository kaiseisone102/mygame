// src/renderer/screens/mainScreen/screen/TitleOverlay.ts

import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { InputAxis, UIActionEvent } from "../../../input/mapping/InputMapper";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { TitleOverlayController } from "./controller/TitleOverlayController";

/**
 * TitleScreen
 *
 * 役割:
 * - ゲーム起動時のタイトル画面
 * - CONFIRM でゲーム開始
 * - CANCEL でオプション画面を開く
 * - UIAction のみを受け取る（ゲーム操作は不可）
 */
export class TitleOverlay implements OverlayScreen<void> {
    readonly overlayId: string = OverlayScreenType.TITLE_OVERLAY;
    readonly capturesInput: boolean = true;

    private controller!: TitleOverlayController;

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.controller = new TitleOverlayController();
        this.controller.init(root, initCtx);

        this.hide();
        console.log("[TitleOverlay] done init");
    }

    show(payload: void) {
        this.controller.show(payload);
    }

    hide() {
        this.controller.hide();
    }

    update(delta: number) { }

    handleUIAxes(axes: InputAxis[]): boolean {
        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        this.controller.UIActions(events);
        return true;
    }
}
