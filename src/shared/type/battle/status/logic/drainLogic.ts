// src/shared/type/battle/status/logic/drainLogic.ts

import { BattleEvent } from "../../event/BattleEvent";
import { EventContext } from "../../event/EventContext";

export function drainLogic(rate: number) {

    return {

        onEvent(event: BattleEvent, ctx: EventContext) {

            if (event === BattleEvent.DAMAGE && ctx.source) {
                const owner = ctx.source;

                if (ctx.value) {
                    owner.addHp(Math.floor(ctx.value * rate));
                }
            }

        }

    };
}