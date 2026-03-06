// src/renderer/input/frame/InputFrame.ts
import type { UIActionEvent, GameActionEvent, InputAxis } from "../mapping/InputMapper";

export class InputFrame {
    constructor(
        public uiActions: UIActionEvent[],
        public uiAxisIntents: InputAxis[],
        public gameActions: GameActionEvent[],
        public gameAxisIntents: InputAxis[],
    ) {}

    static empty(): InputFrame {
        return new InputFrame([], [], [], []);
    }
}
