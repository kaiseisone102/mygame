// src/renderer/router/WorldEvent.ts

import { SaveEvent } from "../../shared/events/save/SaveEvents";
import { MapId } from "../../shared/type/MapId";
import { ZonePx } from "../../shared/type/ZonePx";
import { TileStepContext, ZoneContext } from "../../shared/type/ZoneEvent";
import { BattleResult } from "../../shared/type/battle/TargetType";
import { BattleScenePayload } from "../../renderer/screens/battleScene/battleScene";
import { BiomeId } from "shared/type/battle/enemy/BiomeId";

export type WorldEvent =
    // // ワールドマップ変更
    | { type: "CHANGE_WORLD"; mapId: MapId }
    // 初回ロード
    | { type: "ENTER_GAME_START_FLOW" }
    | { type: "INIT_GAME_SCREEN_FINISHED" }
    | SaveEvent
    | BattleEventWorld
    | EnterZoneEvent

type BattleEventWorld =
    | { type: "PLAYER_MOVED", ctx: TileStepContext }
    | { type: "ENCOUNTER_CONFIRMED", biomeId: BiomeId }
    | { type: "BATTLE_STARTED", payload: BattleScenePayload }
    | { type: "BATTLE_RESULT", result: BattleResult }
    | { type: "BATTLE_FINISHED" }
    | { type: "BATTLE_TURN_RESOLVED", result: null }

type EnterZoneEvent =
    | { type: "ZONE_EVENT_TRIGGERED", zone: ZonePx, ctx: ZoneContext }
    | { type: "ZONE_ENTERED_TOWN", zone: ZonePx, ctx: ZoneContext }
    | { type: "ZONE_ENTERED_WARP", zone: ZonePx, ctx: ZoneContext }
    | { type: "PLAYER_ENTERED_ZONE", zone: ZonePx, ctx: ZoneContext }
