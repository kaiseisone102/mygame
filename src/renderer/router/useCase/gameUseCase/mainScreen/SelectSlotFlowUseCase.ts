// src/renderer/screens/router/useCase/SelectSlotFlowUseCase.ts

import { UIEventPort } from "../../../../../renderer/port/UIEventPort";
import { SaveQueryService } from "../../../../../renderer/save/query/SaveQueryService";
import { MainScreenType } from "../../../../../shared/type/screenType";

export class SelectSlotFlowUseCase {
    constructor(
        private ui: UIEventPort,
        private saveQuery: SaveQueryService
    ) {}

    execute(slotId: number) {
        const slot = this.saveQuery.getSlotView(slotId);

        if (!slot.isEmpty) {
            // 既存セーブ → 即ゲーム開始
            this.ui.emit({
                type: "START_GAME",
                slotId,
                playerName: slot.playerName,
            });
        } else {
            // 空きスロット → 名前入力へ
            this.ui.emit({
                type: "CHANGE_MAIN_SCREEN",
                screen: MainScreenType.INPUT_NAME_SCREEN,
            });
        }
    }
}
