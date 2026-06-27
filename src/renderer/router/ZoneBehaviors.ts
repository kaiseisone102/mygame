// src/renderer/router/ZoneBehaviors.ts

import type { ZoneBehavior } from "../game/map/zone/type/ZoneBehavior";
import { ZoneContext, ZoneEventMap } from "../../shared/type/ZoneEvent";
import { ZoneObject } from "../../shared/type/zone/ZoneObject";
import { ZoneType } from "../../shared/type/ZoneType";
import { EventBus } from "./EventBus";

/**
 * ZoneBehaviors を生成するファクトリ。
 * eventBus を注入することで、app.ts のグローバル singleton への直 import 依存を排除する。
 *
 * 各 onEnter は「何が起きたか(ゾーン種別)」を eventBus に通知するだけ。
 * それを World にどう伝えるかは ZoneEventBridge が決める。
 */
export function createZoneBehaviors(eventBus: EventBus<ZoneEventMap>): Record<ZoneType, ZoneBehavior> {
    return {
        ENTRY: {
            onEnter: (zone: ZoneObject, ctx: ZoneContext) => {
                eventBus.emit("ZONE_ENTER_TOWN", { zone, ctx });
            },
        },

        FIELD_ENEMY: {
            onEnter: (zone: ZoneObject, ctx: ZoneContext) => {
                eventBus.emit("ZONE_ENTER_ENEMY", { zone, ctx });
            },
        },

        RANDOM_ENEMY_ENCOUNT: {},

        WALKABLE_ZONE: {},

        EVENT: {
            onEnter: (zone: ZoneObject, ctx: ZoneContext) => {
                const id = zone.id;
                if (!id) return;

                const mapId = ctx.mapId;
                const flagsByWorld = ctx.gameState.eventFlags[mapId] ??= {};

                if (flagsByWorld[id]) return;
                flagsByWorld[id] = true;

                eventBus.emit("ZONE_ENTER_EVENT", { zone, ctx });
            }
        },

        WARP: {
            onEnter: (zone: ZoneObject, ctx: ZoneContext) => {
                eventBus.emit("ZONE_ENTER_WARP", { zone, ctx });
            },
        },

        TRAP: {},

        OBSTACLE: {},
    };
}
