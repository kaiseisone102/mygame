// src/renderer/router/ZoneEventBridge.ts

import { eventBus } from "../../renderer/app";
import { WorldEvent } from "../../renderer/router/WorldEvent";

// --------------------------------------------------
// Zoneイベント → Worldイベント変換ブリッジ
// --------------------------------------------------
// 役割:
// ・renderer 層で発生した Zone 関連イベントを購読する
// ・それらを World ドメインが理解できる WorldEvent に変換して流す
// ・UI / 入力層と World ロジック層の直接依存を切る
//
// ポイント:
// ・eventBus は「何が起きたか」を通知するだけ
// ・このファイルが「どう解釈して World に伝えるか」を決める
// --------------------------------------------------
export function registerZoneEventBridge(
    // World 側にイベントを流すためのコールバック
    emitWorld: (e: WorldEvent) => void
) {

    // --------------------------------------------------
    // 通常ゾーンイベント侵入
    // --------------------------------------------------
    eventBus.on("ZONE_ENTER_EVENT", (payload) => {
        emitWorld({
            type: "ZONE_EVENT_TRIGGERED",
            zone: payload.zone,
            ctx: payload.ctx,
        });
    });

    // --------------------------------------------------
    // 町エリア侵入
    // --------------------------------------------------
    eventBus.on("ZONE_ENTER_TOWN", (payload) => {
        emitWorld({
            type: "ZONE_ENTERED_TOWN",
            ctx: payload.ctx,
            zone: payload.zone,
        });
    });

    // --------------------------------------------------
    // ワープゾーン侵入
    // --------------------------------------------------
    eventBus.on("ZONE_ENTER_WARP", (payload) => {
        emitWorld({
            type: "ZONE_ENTERED_WARP",
            ctx: payload.ctx,
            zone: payload.zone,
        });
    });

    // --------------------------------------------------
    // 敵エリア侵入
    // --------------------------------------------------
    // ・World に「戦闘開始要求」を通知
    // ・同時にランダムエンカウント判定を要求する
    eventBus.on("ZONE_ENTER_ENEMY", (payload) => {
        emitWorld({
            type: "PLAYER_ENTERED_ZONE",
            zone: payload.zone,
            ctx: payload.ctx
        });
    });

    // ランダムエンカウント要求
    eventBus.on("REQUEST_RANDOM_ENCOUNTER", (payload) => {
        emitWorld({
            type: "PLAYER_MOVED",
            ctx: {
                mapId: payload.mapId,    // mapId
                pos: payload.pos,        // WorldPosition
                biomeId: payload.biomeId
            }
        });
    });

}
