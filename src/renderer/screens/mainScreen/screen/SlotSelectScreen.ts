// src/renderer/screens/mainScreens/screen/slotSelectScreen.ts

import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { MainScreen } from "../../interface/screen/MainScreen";
import { UseUIAxesScreen } from "../../interface/screen/UseUIAxesScreen";
import { SlotSelectScreenController } from "./controller/SlotSelectScreenController";

/**
 * SlotSelectScreen
 *
 * 役割:
 * - セーブスロット選択画面
 * - Axis でスロット移動
 * - CONFIRM で決定 / CANCEL でタイトルに戻る
 *
 * 入力方針:
 * - Axis / Action ともに処理はするが
 *   「他の画面に流しても問題ない」ため return false
 */
export class SlotSelectScreen implements MainScreen, UseUIAxesScreen {
    private controller!: SlotSelectScreenController;

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.controller = new SlotSelectScreenController;
        this.controller.init(root, initCtx);
        this.hide();
        console.log("[SlotSelectScreen] done init")
    }

    show() {
        this.controller.show();
    }

    hide() {
        this.controller.hide();
    }

    update(delta: number) {
        this.controller.update(delta);
    }

    /* =====================
       Input
       ===================== */

    /**
     * UI Axis 入力
     * - UP / LEFT : 前のスロット
     * - DOWN / RIGHT : 次のスロット
     */
    handleUIAxes(axes: InputAxis[]): boolean {
        this.controller.UIAxes(axes);
        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        this.controller.UIActions(events);
        return true;
    }
}
