// src/renderer/router/AppUIEvent.ts

import { BattleAction } from "../../shared/type/battle/BattleAction";
import { PlayerState } from "../../shared/type/PlayerState";
import { MainScreenType } from "../../shared/type/screenType";
import { ItemData } from "../game/map/talkNPC/ItemData";
import { NpcData } from "../game/map/talkNPC/NPCData";
import { SignData } from "../game/map/talkNPC/SignData";
import { BattleEvent } from "../game/battle/event/BattleEvent";
import { BattleInput } from "./useCase/gameUseCase/battle/BattleInputUseCase";
import { WorldPxPosition } from "../../shared/type/playerPosition/posType";
import { OverlayPayloadMap } from "../../renderer/screens/interface/overlay/overlayPayloadMap";
import { BattleBasicCommandPayload, BattleCommandSelectedPayload } from "../../renderer/screens/battleScene/overlayScreen/BattleBasicCommandOverlay";

export type AppUIEvent =
    | { type: "OPEN_YES_NO"; message: string; onYes: () => void; onNo: () => void; }
    // 画面遷移
    | { type: "CHANGE_MAIN_SCREEN", screen: MainScreenType }

    // 入力ロック
    | { type: "INPUT_CONTROLL", lock: boolean }

    // 初期化完了後画面
    | { type: "EXIT_TO_TITLE" }
    | { type: "EXIT_TO_SLOT_SELECT_MENU" }
    | { type: "GO_SLOT_SELECT" }


    // セーブ ?? 確認メッセージ画面へ : 名前入力画面へ => ゲームスタート
    | { type: "SHOW_START_MESSAGE" }
    | { type: "SHOW_INPUT_NAME_OVERLAY", slotId: number }
    | { type: "START_GAME", slotId: number, playerName: string }

    | { type: "SAVE_GAME" }

    // インベントリ
    | { type: "SELECT" }

    // Overlay
    | UIOverlayEvent

    // 動的イベント
    | { type: "REQUEST_INTERACT", playerState: PlayerState, playerPos: WorldPxPosition, npcs: NpcData[], signs: SignData[], items: ItemData[] }
    | { type: "NPC_INTERACT"; message: string[] }
    | { type: "READ_SIGN"; message: string[] }
    | { type: "COLLECT_ITEM"; item: ItemData[] }
    | { type: "SHOW_TRIGGER_MESSAGE"; message: string }

    // イベント結果
    | { type: "ITEM_COLLECTED"; item: ItemData; }

    // 戦闘コマンド画面遷移
    | BattleEventGroup

type BattleEventGroup =
    // ===== UI段階 =====
    | { type: "REQUEST_COMMAND", payload: BattleBasicCommandPayload }
    | { type: "BATTLE_COMMAND_SELECTED", payload: BattleCommandSelectedPayload }// UI操作
    | { type: "ITEM_SELECTED", itemId: string }
    | { type: "PLAYER_COMMAND_SELECTED", input: BattleInput }
    | { type: "BATTLE_ITEM_SELECTED"; itemId: string }
    // ===== 戦闘確定段階 =====
    | { type: "BATTLE_ACTION_DECIDED", action: BattleAction }// 戦闘的に確定
    // ===== 演出 =====
    | BattleVisualEvent
    // ===== その他 =====
    | { type: "OPEN_BATTLE_LOG" }
    | { type: "SEND_MESSAGE" }

type UIOverlayEvent =
    | PushOverlayEvent
    | { type: "POP_OVERLAY" }
    | { type: "POP_ALL_OVERLAY" }

type BattleVisualEvent =
    | { type: "BATTLE_EVENT"; event: BattleEvent }
    | { type: "ADD_BATTLE_LOG"; message: string };

type PushOverlayEvent = {
    [K in keyof OverlayPayloadMap]: { // OverlayPayloadMap が void なら payload 禁止
        type: "PUSH_OVERLAY",
        overlay: K,
        payload: OverlayPayloadMap[K]
    }
}[keyof OverlayPayloadMap]; // ここで union に
