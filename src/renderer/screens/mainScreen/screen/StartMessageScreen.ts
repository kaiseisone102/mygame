// src/renderer/screens/mainScreens/screen/StartMessageScreen.ts

import { InputAxis, UIActionEvent } from "@/renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { MainScreen } from "../../interface/screen/MainScreen";
import { StartMessageScreenController } from "./controller/StartMessageScreenController";

/**
 * StartMessageScreen
 *
 * 役割:
 * - スロット選択後に表示される「開始確認メッセージ」画面
 * - CONFIRM / CANCEL のみを受け付ける
 * - Axis（上下左右）は扱わない
 *
 * 入力方針:
 * - CONFIRM / CANCEL はこの画面で消費する（return true）
 * - それ以外の入力は無視して次へ流す（return false）
 */
export class StartMessageScreen implements MainScreen {
    private controller!: StartMessageScreenController;

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.controller = new StartMessageScreenController;
        this.controller.init(root, initCtx);
        this.controller.hide();
        console.log("[StartMessageScreen] done init")
    }

    show() {
        this.controller.show();
    }

    hide() {
        this.controller.hide();
    }

    update(delta: number) {}
    
    handleUIAxes(axes: InputAxis[]): boolean {
        return true;
    }
    handleUIActions(events: UIActionEvent[]): boolean {
        this.controller.UIActions(events);
        return true
    }

    showSlotMessage(slotId: number, hasSave: boolean, playerName?: string) {
        this.controller.showSlotMessage(slotId, hasSave, playerName);
    }
}