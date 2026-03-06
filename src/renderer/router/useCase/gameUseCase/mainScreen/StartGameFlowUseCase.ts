// src/renderer/usecase/StartGameFlowUseCase.ts

import { MainScreenType } from "../../../../../shared/type/screenType";
import { LoadSlotsUseCase } from "./LoadSlotUseCase";
import { BgmUseCase } from "../audio/BgmUseCase";
import { ScreenPort } from "../../../../../renderer/port/ScreenPort";

export class StartGameFlowUseCase {
    constructor(
        private screens: ScreenPort,
        private bgmUseCase: BgmUseCase,
    ) { }

    execute = async () => {
        console.log("[StartGameFlow] screens =", this.screens);
        this.screens.changeMain(MainScreenType.INIT_GAME_SCREEN);
        this.bgmUseCase.onMainScreenChanged(MainScreenType.INIT_GAME_SCREEN);

        //     // 1. セーブスロット読み込み
        //     await this.loadSlotsUseCase.execute();

        //     // 2. BGM 初期化
        //     this.bgmUseCase.onMainScreenChanged(MainScreenType.TITLE);

        //     // 3. タイトル画面へ
        //     this.screens.changeMain(MainScreenType.TITLE);
    }
}

// async execut() {} this.がなくなる（コールバックで渡したら）
// execute = async () => {} this は 永久に固定 将来 execute をコールバックで渡しても安全