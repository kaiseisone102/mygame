// src/renderer/router/useCase/gameUseCase/battle/AddBattleLogUseCase.ts

import { ScreenPort } from "../../../../../renderer/port/ScreenPort";
import { OverlayScreenType } from "../../../../../shared/type/screenType";

export class AddBattleLogUseCase {
    constructor(private screenPort: ScreenPort) { }

    execute(message: string) {
        this.screenPort.getOverlayScreen(OverlayScreenType.BATTLE_LOG).addLog?.(message);
    }
}