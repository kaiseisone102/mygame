// src/renderer/input/axis/AxisEventQueue.ts
import { AxisEvent } from "./AxisEvent";

export class AxisEventQueue {
    private events: AxisEvent[] = [];

    push(event: AxisEvent) {
        this.events.push(event);
    }

    consume(): AxisEvent[] {
        const copy = [...this.events];
        this.events.length = 0;
        return copy;
    }
}
