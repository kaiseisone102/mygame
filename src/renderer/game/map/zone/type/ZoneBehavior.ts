// src/renderer/game/map/zone/ZoneBehavior.ts

import { ZoneObject } from "../../../../../shared/type/zone/ZoneObject";
import { ZoneContext } from "../../../../../shared/type/ZoneEvent";

export interface ZoneBehavior {
    onEnter?(zone: ZoneObject, ctx: ZoneContext): void;
    onLeave?(zone: ZoneObject, ctx: ZoneContext): void;
    update?(zone: ZoneObject, ctx: ZoneContext, delta: number): void;
}
