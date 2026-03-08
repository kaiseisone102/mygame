// src/renderer/game/battle/event/BattleEventQueue.ts

import { delay } from "../../../../renderer/utils/delay";
import { BattleEvent, BattleEventKind } from "./BattleEvent";

export class BattleEventQueue {
    private queue: BattleEvent[] = [];
    private playing = false;
    private cancelled = false;

    constructor(
        private emitBattle: (e: { type: "BATTLE_EVENT_QUEUE"; event: BattleEvent }) => void
    ) { }

    async play(events: BattleEvent[]): Promise<void> {
     
        this.queue.push(...events);

        if (this.playing) return;

        this.playing = true;
        this.cancelled = false;

        while (this.queue.length > 0 && !this.cancelled) {
            const event = this.queue.shift()!;
            this.emitBattle({ type: "BATTLE_EVENT_QUEUE", event });
            await delay(this.getDuration(event));
        }

        this.playing = false;
    }

    clear() {
        this.cancelled = true;
        this.queue = [];
    }

    private getDuration(event: BattleEvent): number {
        switch (event.type) {
            case BattleEventKind.DAMAGE: return 500;
            case BattleEventKind.HEAL: return 500;
            case BattleEventKind.STATUS_APPLIED: return 400;
            case BattleEventKind.BUFF_APPLIED: return 400;
            case BattleEventKind.DEAD: return 800;
            default: return 300;
        }
    }
}
