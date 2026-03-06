// src/renderer/game/zoneEventHandlers/cave.ts
import { MainScreenType } from "@/shared/type/screenType";
import { UIEventPort } from "@/renderer/port/UIEventPort";

export const caveHandlers = {
    CAVE_ENTRANCE: ({ ctx, uiEventPort }) => {
        uiEventPort.emit({
            type: "OPEN_YES_NO",
            message: "洞窟に入りますか？",
            onYes: () => {
                uiEventPort.emit({
                    type: "CHANGE_MAIN_SCREEN",
                    screen: MainScreenType.GRAVE_CAVE,
                });
            },
        });
    },
};
