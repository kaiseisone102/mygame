// registerZoneEventHandlers.ts
import { eventBus } from "@/renderer/app";
import { UIEventPort } from "@/renderer/port/UIEventPort";
import { zoneEventHandlers } from "./zoneEventHandlers";

export function registerZoneEventHandlers(uiEventPort: UIEventPort) {
    eventBus.on("ZONE_ENTER_EVENT", ({ zone, ctx }) => {
        zoneEventHandlers[zone.id]?.({
            zone,
            ctx,
            uiEventPort,
        });
    });
}
