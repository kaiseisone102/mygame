import { WorldEvent } from "../../../../../renderer/router/WorldEvent";
import { BattleResult } from "../../../../../shared/type/battle/TargetType";

export class BattleResultUseCase {
    constructor(
        private emitWorld: (e: WorldEvent) => void
    ) { }

    execute(result: BattleResult) {

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

        this.emitWorld({
            type: "BATTLE_FINISHED"
        })
    }
}
