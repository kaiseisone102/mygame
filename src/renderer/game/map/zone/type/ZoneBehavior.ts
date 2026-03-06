// src/renderer/game/map/zone/ZoneBehavior.ts

import { ZoneContext } from "../../../../../shared/type/ZoneEvent";
import { ZonePx } from "../../../../../shared/type/ZonePx";

export interface ZoneBehavior {
    onEnter?(zone: ZonePx, ctx: ZoneContext): void;
    onLeave?(zone: ZonePx, ctx: ZoneContext): void;
    update?(zone: ZonePx, ctx: ZoneContext, delta: number): void;
}
