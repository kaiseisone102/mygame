// src/renderer/keyHundle/keyInput/types/InputState.ts

import { CommonActionEvent, GameActionEvent, InputAxis, UIActionEvent } from "../mapping/InputMapper";

export class InputState {
    // -----------------
    // Axis state
    // -----------------
    private axisMap: Record<InputAxis, boolean> = {
        UP: false,
        DOWN: false,
        LEFT: false,
        RIGHT: false,
    };

    // -----------------
    // Action Queue
    // -----------------
    private uiActions: UIActionEvent[] = [];
    private gameActions: GameActionEvent[] = [];

    locked = false; // 入力ロック

    pushCommonAction(event: CommonActionEvent) {
        // UIへ
        this.uiActions.push({
            action: event.action, // UIAction として成立
            type: event.type,
        });

        // GAMEへ
        this.gameActions.push({
            action: event.action, // GameAction として成立
            type: event.type,
        });
    }

    // -----------------
    // Axis
    // -----------------
    setAxis(axis: InputAxis, pressed: boolean) {
        this.axisMap[axis] = pressed;
    }

    isAxisPressed(axis: InputAxis): boolean {
        return this.axisMap[axis];
    }

    // -----------------
    // Action enqueue
    // -----------------
    pushUIAction(event: UIActionEvent) {
        this.uiActions.push(event);
    }

    pushGameAction(event: GameActionEvent) {
        this.gameActions.push(event);
    }

    // -----------------
    // Action consume
    // -----------------
    consumeUIActions(): UIActionEvent[] {
        const actions = this.uiActions;
        this.uiActions = [];
        return actions;
    }

    consumeGameActions(): GameActionEvent[] {
        const actions = this.gameActions;
        this.gameActions = [];
        return actions;
    }

    // -----------------
    // Reset
    // -----------------
    reset() {
        (Object.keys(this.axisMap) as InputAxis[]).forEach(axis => {
            this.axisMap[axis] = false;
        });
        this.uiActions = [];
        this.gameActions = [];
    }
}
