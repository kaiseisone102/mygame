// src/renderer/game/zoneEventHandlers/forest.ts
export const forestHandlers = {
    FOREST_WARNING: ({ uiEventPort }) => {
        uiEventPort.emit({
            type: "SHOW_TRIGGER_MESSAGE",
            message: "森の奥から不気味な気配がする…",
        });
    },
};
