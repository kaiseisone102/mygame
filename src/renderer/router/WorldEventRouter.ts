// src/renderer/router/WorldEventRouter.ts

import { WorldEvent } from "../../renderer/router/WorldEvent";
import { MainScreenType } from "../../shared/type/screenType";
import { ScreenPort } from "../port/ScreenPort";
import { GameUseCases } from "./useCase/gameUseCase/facade/GameUseCases";
import { GameState } from "../../shared/data/gameState";
import { MapId } from "../../shared/type/MapId";

/**
 * EventRouter は UseCase の呼び出し
 * screenManager.changeMain の呼び出し
 * popOverlay()　などの呼び出しのみ
 */
export class WorldEventRouter {

    constructor(
        private screens: ScreenPort,
        private gameState: GameState,
        private gameUseCases: GameUseCases,
    ) { }

    dispatch(event: WorldEvent) {
        switch (event.type) {
            case "ENTER_GAME_START_FLOW":
                this.gameUseCases.startGameFlowUseCase.execute();
                break;
            case "INIT_GAME_SCREEN_FINISHED":
                this.screens.changeMain(MainScreenType.TITLE, undefined);
                break;
            case "AUTO_SAVE":
                this.gameUseCases.saveGameUseCase.execute();
                break;
            // MainScreen 共通イベント
            case "CHANGE_WORLD":
                if (!event.mapId) break;
                this.gameUseCases.changeWorldUseCase.execute(event.mapId);
                break;

            // 設定保存
            case "SAVE_CONFIG": this.gameUseCases.saveConfigUseCase.execute(event.config); break;

            case "ZONE_ENTERED_TOWN": {
                this.gameUseCases.enteredTownUseCase.execute(event.ctx);
                break;
            }
            case "ZONE_ENTERED_WARP": {
                this.gameUseCases.changeWorldUseCase.execute(MapId.WORLD_MAP);
                break;
            }

            case "PLAYER_ENTERED_ZONE":
                this.gameUseCases.encounterUseCase.onPlayerEnteredZone({ zone: event.zone, ctx: event.ctx });
                break;

            // 戦闘イベント
            // エンカウント判定
            case "PLAYER_MOVED":
                this.gameUseCases.encounterUseCase.onStep(event.ctx);
                break;
            // 敵が出現
            case "ENCOUNTER_CONFIRMED":
                this.gameUseCases.battleStartedUseCase.execute();
                break;
            // 戦闘画面へ
            case "BATTLE_STARTED": {
                this.gameUseCases.encounterUseCase.reset();
                this.screens.changeMain(MainScreenType.BATTLE_SCENE, event.payload);
                break;
            }
            // 戦闘結果
            case "BATTLE_RESULT":
                this.gameUseCases.battleResultUseCase.execute(event.result);
                break;
            // 戦闘前の場所へ戻す
            case "BATTLE_FINISHED": {
                // ワールド復帰
                //   changeWorld
                //   座標復元
                // 👉 ここで BattleManager は破棄してOK

                const ret = this.gameState.battleReturn;
                if (!ret) break;

                // 戦闘前のワールドに戻す（画面遷移もここで完了）
                this.gameUseCases.changeWorldUseCase.execute(ret.mapId);

                // 座標復元
                this.gameState.setPlayerPosition(ret.mapId, ret.pos);

                // 戦闘復帰情報クリア
                this.gameState.battleReturn = undefined;

                break;
            }

            default:
                console.warn("[EventRouter] Unknown event:");
                break;
        }
    }
}
