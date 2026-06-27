// registerZoneEventHandlers.ts
// NOTE: 現状どこからも呼ばれていない dead code。
// 依存の観点のみ整理: eventBus はグローバル import をやめ、引数で受け取る(DI)。
import { UIEventPort } from "@/renderer/port/UIEventPort";
import { EventBus } from "@/renderer/router/EventBus";
import { ZoneEventMap } from "@/shared/type/ZoneEvent";
import { zoneEventHandlers } from "./zoneEventHandlers";

export function registerZoneEventHandlers(eventBus: EventBus<ZoneEventMap>, uiEventPort: UIEventPort) {
    eventBus.on("ZONE_ENTER_EVENT", ({ zone, ctx }) => {
        zoneEventHandlers[zone.id]?.({
            zone,
            ctx,
            uiEventPort,
        });
    });
}
