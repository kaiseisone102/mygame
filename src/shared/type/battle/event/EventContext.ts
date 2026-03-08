import { Battler } from "../../../../renderer/game/battle/core/Battler";

export type EventContext = {
    source?: Battler
    target?: Battler
    value?: number
}