// src/renderer/input/keyboard/axis/AxisRepeater.ts

import { InputAxis } from "../../mapping/InputMapper";

export interface AxisSource {
    on(handler: (axis: InputAxis, pressed: boolean) => void): void;
    emit(axis: InputAxis, pressed: boolean): void;
}
