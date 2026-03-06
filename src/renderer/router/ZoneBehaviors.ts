// src/renderer/router/ZoneBehaviors.ts

import { eventBus } from "../../renderer/app";
import type { ZoneBehavior } from "../game/map/zone/type/ZoneBehavior";
import { ZoneType } from "../../shared/type/ZoneType";
import { ZonePx } from "../../shared/type/ZonePx";
import { ZoneContext } from "../../shared/type/ZoneEvent";

export const ZoneBehaviors: Record<ZoneType, ZoneBehavior> = {
    ENTRY: {
        onEnter: (zone: ZonePx, ctx: ZoneContext) => {
            eventBus.emit("ZONE_ENTER_TOWN", { zone, ctx });
        },
    },

    FIELD_ENEMY: {
        onEnter: (zone: ZonePx, ctx: ZoneContext) => {
            eventBus.emit("ZONE_ENTER_ENEMY", { zone, ctx });
        },
    },

    RANDOM_ENEMY_ENCOUNT: {},

    WALKABLE_ZONE: {},

    EVENT: {
        onEnter: (zone: ZonePx, ctx: ZoneContext) => {
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
        onEnter: (zone: ZonePx, ctx: ZoneContext) => {
            eventBus.emit("ZONE_ENTER_WARP", { zone, ctx });
        },
    },

    TRAP: {},

    OBSTACLE: {},
};

// やりたいこと	            書く場所
// Zoneに入った	           ZoneBehaviors
// Zoneの種類を通知	        EventBus
// 町に入ったらどうなるか	 UseCase or WorldEventRouter
// Worldを切り替える	    ChangeWorldUseCase
// 画面を変える	            WorldEventRouter