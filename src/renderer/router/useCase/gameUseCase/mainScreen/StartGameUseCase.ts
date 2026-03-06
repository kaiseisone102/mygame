// src/renderer/router/useCase/mainScreen/StartGameUseCase.ts

import { SaveManager } from "../../../../../renderer/save/saveManager";
import { MainScreenType } from "../../../../../shared/type/screenType";
import { ChangeWorldUseCase } from "../world/ChangeWorldUseCase";

export class StartGameUseCase {
    constructor(
        private saveManager: SaveManager,
        private changeWorldUseCase: ChangeWorldUseCase,
    ) { }

    execute(slotId: number, playerName?: string) {
        const save = this.saveManager.load(slotId);

        if (!save) {
            // 新規
            this.saveManager.createNew(slotId, playerName ?? "");
        }

        // ゲーム開始世界へ
        this.changeWorldUseCase.execute(MainScreenType.FOREST_TEMPLE);
    }
}
