// src/renderer/input/intent/InputIntentResolver.ts

import { InputAxis } from "../mapping/InputMapper";
import { InputState } from "../state/InputState";
import { InputIntent } from "./InputIntent";

export class InputIntentResolver
    implements InputIntent {

    constructor(private inputState: InputState) { }

    resolveUIAxisIntents(): InputAxis[] {
        return this.resolveAxis();
    }

    resolveGameAxisIntents(): InputAxis[] {
        return this.resolveAxis();
    }

    private resolveAxis(): InputAxis[] {
        const intents: InputAxis[] = [];

        if (this.inputState.isAxisPressed("UP")) intents.push("UP");
        if (this.inputState.isAxisPressed("DOWN")) intents.push("DOWN");
        if (this.inputState.isAxisPressed("LEFT")) intents.push("LEFT");
        if (this.inputState.isAxisPressed("RIGHT")) intents.push("RIGHT");

        return intents;
    }
}
