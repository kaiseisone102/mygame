// src/renderer/router/useCase/gameUseCase/battle/BattleInputUseCase.ts

import { BattlePort } from "../../../../../renderer/game/battle/port/BattlePort";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { BattleInput } from "../../../../../shared/type/battle/BattleAction";

export class BattleInputUseCase {

    constructor(
        private battlePort: BattlePort,
        private emitUI: (e: AppUIEvent) => void
    ) { }

    execute(input: BattleInput) {
        this.battlePort.resolvePlayerInput(input);
    }

}
