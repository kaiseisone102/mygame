// src/renderer/screens/mainScreens/screen/controller/InitGameScreenController.ts

import { ScreenInitContext } from "../../../../../renderer/screens/interface/context/ScreenInitContext";
import { MainScreenType } from "../../../../../shared/type/screenType";

export class InitGameScreenController {
    private started = false;

    constructor(
        private root: HTMLElement,
        private ctx: ScreenInitContext
    ) { }

    show() {
        if (this.started) return;
        this.started = true;
        this.ctx.emitWorld({
            type: "INIT_GAME_SCREEN_FINISHED",
        });
    }

    hide() {
        this.root.innerHTML = "";
    }

    private async startLoading() {
        // 1. セーブスロット一覧ロード
        await this.ctx.emitWorld({ type: "ENTER_GAME_START_FLOW" });

        // 2. 演出用ウェイト
        await this.wait(300);

        // 3. タイトル画面へ
        this.goToTitle();
    }

    private goToTitle() {
        this.ctx.emitUI({
            type: "CHANGE_MAIN_SCREEN",
            screen: MainScreenType.TITLE,
        });
    }

    private wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
