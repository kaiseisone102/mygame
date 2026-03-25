// src/renderer/router/useCase/mainScreen/StartGameUseCase.ts

import { GameState } from "../../../../../shared/data/gameState";
import { SaveManager } from "../../../../../renderer/save/saveManager";
import { MainScreenType } from "../../../../../shared/type/screenType";
import { ChangeWorldUseCase } from "../world/ChangeWorldUseCase";

export class StartGameUseCase {
    constructor(
        private saveManager: SaveManager,
        private changeWorldUseCase: ChangeWorldUseCase,
        private gamestate: GameState
    ) { }

    async execute(slotId: number, playerName?: string) {
        const hasSave = await this.saveManager.load(slotId);

        if (!hasSave) {
            // 新規
            console.log("[StartGameUseCase]: 新規スタート");
            this.saveManager.createNew(slotId, playerName ?? "");
        } else {
            console.log("[StartGameUseCase]: コンティニュー");
        }

        // ゲーム開始世界へ
        this.changeWorldUseCase.execute(MainScreenType[this.gamestate.currentMapId]);
    }
}
