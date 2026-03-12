// src/renderer/router/WorldEvent.ts

import { ZoneObject } from "../../shared/type/zone/ZoneObject";
import { BattleScenePayload } from "../../renderer/screens/battleScene/BattleScene";
import { SaveEvent } from "../../shared/events/save/SaveEvents";
import { MapId } from "../../shared/type/MapId";
import { TileStepContext, ZoneContext } from "../../shared/type/ZoneEvent";
import { BattleResult } from "../../shared/type/battle/TargetType";
import { BiomeId } from "../../shared/type/battle/enemy/BiomeId";
import { ItemData } from "../../renderer/game/map/talkNPC/ItemData";

export type WorldEvent =
    // // ワールドマップ変更
    | { type: "CHANGE_WORLD"; mapId: MapId }
    // 初回ロード
    | { type: "ENTER_GAME_START_FLOW" }
    | { type: "INIT_GAME_SCREEN_FINISHED" }
    | { type: "ITEM_COLLECTED", item: ItemData }
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
    | { type: "ZONE_EVENT_TRIGGERED", zone: ZoneObject, ctx: ZoneContext }
    | { type: "ZONE_ENTERED_TOWN", zone: ZoneObject, ctx: ZoneContext }
    | { type: "ZONE_ENTERED_WARP", zone: ZoneObject, ctx: ZoneContext }
    | { type: "PLAYER_ENTERED_ZONE", zone: ZoneObject, ctx: ZoneContext }
