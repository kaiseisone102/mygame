// src/renderer/router/UIEventRouter.ts

import { UIEventPort } from "../../renderer/port/UIEventPort";
import { TechniqueId } from "../../shared/master/battle/type/SkillPreset";
import { CommandActionType } from "../../shared/type/battle/TargetType";
import { MainScreenType, OverlayScreenType } from "../../shared/type/screenType";
import { ScreenPort } from "../port/ScreenPort";
import { AppUIEvent } from "./AppUIEvents";
import { GameUseCases } from "./useCase/gameUseCase/facade/GameUseCases";

export class UIEventRouter implements UIEventPort {
    emit(event: AppUIEvent) {
        this.dispatch(event);
    }
    private gameUseCases!: GameUseCases;
    constructor(
        private screens: ScreenPort,
    ) { }
    setUseCases(useCases: GameUseCases) {
        this.gameUseCases = useCases;
    }
    dispatch(event: AppUIEvent) {
        switch (event.type) {
            case "OPEN_YES_NO": this.screens.openYesNo(event); break;

            case "INPUT_CONTROLL":
                this.screens.lockInput(event.lock);
                break;

            case "CHANGE_MAIN_SCREEN": this.screens.changeMain(event.screen, undefined); break;

            case "EXIT_TO_TITLE": this.gameUseCases.changeMainScreenUseCase.execute(MainScreenType.TITLE); break;

            case "GO_SLOT_SELECT": this.gameUseCases.changeMainScreenUseCase.execute(MainScreenType.SLOT_SELECT); break;

            case "SHOW_INPUT_NAME_OVERLAY":
                this.screens.pushOverlay(OverlayScreenType.INPUT_NAME_OVERLAY, undefined);
                const inputNameOverlay = this.screens.getOverlayScreen(OverlayScreenType.INPUT_NAME_OVERLAY);
                inputNameOverlay?.setSlotId?.(event.slotId);
                break;

            case "START_GAME": this.gameUseCases.startGameUseCase.execute(event.slotId, event.playerName); break;

            case "SAVE_GAME": this.gameUseCases.saveGameUseCase.execute(); break;

            case "SHOW_START_MESSAGE": this.gameUseCases.changeMainScreenUseCase.execute(MainScreenType.START_MESSAGE); break;

            // インタラクト振り分け処理
            case "REQUEST_INTERACT": this.gameUseCases.interactUseCase.execute(event); break;

            case "SHOW_TRIGGER_MESSAGE":
                this.screens.pushOverlay(OverlayScreenType.MESSAGE_LOG, { messages: [event.message] });
                break;

            // Overlay 操作
            case "PUSH_OVERLAY": this.screens.pushOverlay(event.overlay, event.payload); break;
            case "POP_OVERLAY": this.screens.popOverlay(); break;
            case "POP_ALL_OVERLAY": this.screens.popAllOverlay(); break;

            // 戦闘UIイベント
            case "REQUEST_COMMAND": {
                this.screens.pushOverlay(OverlayScreenType.BATTLE_BASIC_COMMAND_OVERLAY, event.payload);
                break;
            }
            case "BATTLE_COMMAND_SELECTED": {  // UI操作
                switch (event.payload.commandId) {
                    case CommandActionType.ATTACK: // 攻撃対象選択用オーバーレイを表示
                        this.screens.pushOverlay(OverlayScreenType.ATTACK_TARGET_OVERLAY, { phaseSecond: event.payload });
                        break;

                    case CommandActionType.TECHNIQUE:
                    case CommandActionType.MAGIC:
                        this.gameUseCases.battleCommandSelectedUseCase.execute(event.payload);
                        break;

                    case CommandActionType.ITEM:
                        this.screens.pushOverlay(OverlayScreenType.ITEM_SELECT_OVERLAY_IN_BATTLE, undefined);
                        break;

                    case CommandActionType.DEFENCE:
                        this.gameUseCases.battleInputUseCase.execute({ commandId: event.payload.commandId, actorTemplateId: event.payload.phaseBase.actorTemplateId, actorInstanceId: event.payload.phaseBase.actorInstanceId, actorName: event.payload.phaseBase.actorName, enemy: [], skillId: TechniqueId.GUARD, targetId: event.payload.phaseBase.actorInstanceId });
                        break;

                    case CommandActionType.ESCAPE:// すぐにコマンド処理を実行
                        this.gameUseCases.battleInputUseCase.execute({ commandId: event.payload.commandId, actorTemplateId: event.payload.phaseBase.actorTemplateId, actorInstanceId: event.payload.phaseBase.actorInstanceId, actorName: event.payload.phaseBase.actorName, enemy: [], skillId: TechniqueId.ESCAPE, targetId: event.payload.phaseBase.actorInstanceId });
                        break;
                }
                break;
            }

            case "SKILL_SELECTED": this.screens.pushOverlay(OverlayScreenType.ATTACK_TARGET_OVERLAY, { phaseSecond: event.payload.phaseBase, skill: event.payload.skillId }); break;

            // case "ITEM_SELECTED":
            //     this.gameUseCases.battleInputUseCase.onItemSelected(event.itemId);
            //     break;

            case "PLAYER_COMMAND_SELECTED": {
                this.gameUseCases.battleInputUseCase.execute(event.input);
                break;
            }

            case "BATTLE_ITEM_SELECTED":
                const targetId = event.itemId;

                const logOverlay = this.screens.getOverlayScreen(OverlayScreenType.BATTLE_LOG);
                logOverlay?.addLog?.(`Player used item #${targetId}!`);
                break;


            case "ADD_BATTLE_LOG": {
                this.gameUseCases.addBattleLogUseCase.execute(event.message);
                break;
            }
        }
    }
}
