// src/renderer/game/zoneEventHandlers/index.ts

import { caveHandlers } from "./cave";
import { forestHandlers } from "./forestTemple";
import { townHandlers } from "./town";

export const zoneEventHandlers = {
    ...forestHandlers,
    ...caveHandlers,
    ...townHandlers,
};
