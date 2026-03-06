// src/shared/events/world/SaveEvent.ts

import { GameConfig } from "../../config/GameConfig";

export type SaveEvent =
    | { type: "SAVE_CONFIG"; config: GameConfig }
    | { type: "AUTO_SAVE" }
