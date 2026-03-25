// src/renderer/router/useCase/gameUseCase/battle/BattleResultUseCase.ts

import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../../renderer/router/WorldEvent";
import { BattleResult } from "../../../../../shared/type/battle/TargetType";

export class BattleResultUseCase {
    constructor(
        private emitWorld: (e: WorldEvent) => Promise<void>,
        private emitUI: (e: AppUIEvent) => Promise<void>
    ) { }

    async execute(result: BattleResult) {

        switch (result) {
            case BattleResult.WIN:
                console.log("game win!!")
                break;
            case BattleResult.LOSE:
                console.log("game lost!!")
                break;
            case BattleResult.ESCAPE:
                console.log("You Escaped!!")
                break;
            default:
                console.log("Battle Game Finished")
                break;
        }

        await this.emitUI({ type: "SAVE_GAME" });
        this.emitWorld({
            type: "BATTLE_FINISHED"
        });
    }
}
