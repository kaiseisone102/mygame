// src/renderer/screens/mainScreen/screen/TitleScreen.ts

import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { MainScreen } from "../../interface/screen/MainScreen";
import { TitleScreenController } from "./controller/TitleScreenController";

/**
 * TitleScreen
 *
 * 役割:
 * - ゲーム起動時のタイトル画面
 * - CONFIRM でゲーム開始
 * - CANCEL でオプション画面を開く
 * - UIAction のみを受け取る（ゲーム操作は不可）
 */
export class TitleScreen implements MainScreen {
    private controller!: TitleScreenController;

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.controller = new TitleScreenController;
        this.controller.init(root, initCtx);
        this.hide();
        console.log("[TitleScreen] done init")
        
    }

    show() {
        this.controller.show();
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
