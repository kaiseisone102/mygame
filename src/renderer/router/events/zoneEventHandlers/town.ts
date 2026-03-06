// src/renderer/game/zoneEventHandlers/town.ts
import { MainScreenType } from "@/shared/type/screenType";

export const townHandlers = {
    TOWN_GATE: ({ uiEventPort }) => {
        uiEventPort.emit({
            type: "CHANGE_MAIN_SCREEN",
            screen: MainScreenType.NO_FEATURE_TOWN,
        });
    },
};
