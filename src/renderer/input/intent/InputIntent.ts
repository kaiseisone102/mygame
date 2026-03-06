// src/renderer/input/intent/InputIntentResolver.ts

import { InputAxis } from "../mapping/InputMapper";

export interface InputIntent {
    resolveUIAxisIntents(): InputAxis[];
    resolveGameAxisIntents(): InputAxis[];
}