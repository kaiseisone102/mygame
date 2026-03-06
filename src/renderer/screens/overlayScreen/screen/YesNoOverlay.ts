// src/renderer/screens/overlayScreens/YesNoOverlay.ts

import { OverlayScreenType } from "../../../../shared/type/screenType";
import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { YesNoEvent } from "../../../../shared/events/ui/YesNoEvent";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { YesNoOverlayScreen } from "../../interface/overlay/OverLayScreens";
import { YesNoOverlayController } from "./controller/YesNoOverlayController";

/**
 * YesNoOverlay
 *
 * 役割:
 * - 「はい」「いいえ」(UIオーバーレイ)を表示する
 * - UIAction / UIAxis を受け取り UI 操作に変換する
 *
 * 入力仕様:
 * - CONFIRM 「はい」/ CANCEL、「いいえ」  → 画面を閉じる
 * - 方向キー → UIカーソル操作（想定）
 *
 * 備考:
 * - Game入力は一切扱わない
 * - capturesInput = true により、背後の画面への入力を遮断する
 */
export class YesNoOverlay implements YesNoOverlayScreen {
    readonly overlayId: string = OverlayScreenType.YES_NO_OVERLAY;

    /** この画面が入力をキャプチャするか */
    readonly capturesInput: true = true;

    private controller!: YesNoOverlayController;

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.controller = new YesNoOverlayController();
        this.controller.init(root, initCtx);
        this.hide();
        console.log("[YesNoOverlay] done init")
    }

    show(event: YesNoEvent): void {
        this.controller.show(event);
    }

    hide(): void {
        this.controller.hide();
    }

    pause() {

    }

    resume(): void {

    }

    update(delta: number): void {
        this.controller.update(delta);
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        this.controller.UIAxes(axes);
        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        this.controller.UIActions(events);
        return true
    }
}
