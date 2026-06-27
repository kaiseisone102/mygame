// src/renderer/router/UIEventRouter.ts

import { UIEventPort } from "../../renderer/port/UIEventPort";
import { TechniqueId } from "../../shared/master/battle/type/SkillPreset";
import { TargetSide } from "../../shared/type/battle/skill/skillFormula";
import { CommandActionType, TargetType } from "../../shared/type/battle/TargetType";
import { MainScreenType, OverlayScreenType } from "../../shared/type/screenType";
import { ScreenPort } from "../port/ScreenPort";
import { AppUIEvent } from "./AppUIEvents";
import { GameUseCases } from "./useCase/gameUseCase/facade/GameUseCases";

export class UIEventRouter implements UIEventPort {

    async emit(event: AppUIEvent): Promise<void> { await this.dispatch(event) };

    private gameUseCases!: GameUseCases;

    constructor(private screens: ScreenPort) { };

    setUseCases(useCases: GameUseCases) { this.gameUseCases = useCases };

    async dispatch(event: AppUIEvent): Promise<void> {
        switch (event.type) {
            case "OPEN_YES_NO": this.screens.openYesNo(event); break;

            case "INPUT_CONTROLL": this.screens.lockInput(event.lock); break;

            case "CHANGE_MAIN_SCREEN": this.screens.changeMain(event.screen, event.payload); break;

            case "START_GAME": await this.gameUseCases.startGameUseCase.execute(event.slotId, event.playerName); break;

            case "SAVE_GAME":
                console.log("SAVE_GAME called");
                await this.gameUseCases.saveGameUseCase.execute();
                break;

            case "SAVE_CONFIG":
                await this.gameUseCases.saveConfigUseCase.execute(event.config);
                break;

            case "AUTO_SAVE":
                console.log("AUTO_SAVE called")
                await this.gameUseCases.saveGameUseCase.execute();
                break;

            case "SHOW_START_MESSAGE": await this.gameUseCases.changeMainScreenUseCase.execute(MainScreenType.START_MESSAGE, undefined); break;

            // インタラクト振り分け処理
            case "REQUEST_INTERACT": await this.gameUseCases.interactUseCase.execute(event); break;

            // フィールドコマンド
            case "SHOW_FIELD_COMMAND": this.gameUseCases.showFieldCommand.execute(); break;

            // 所持金ハッド
            case "ACCESS_CURRENT_GOLD": this.gameUseCases.goldHudUseCase.getGold(); break;
            case "REFRESH_GOLD": this.gameUseCases.goldHudUseCase.refresh(); break;

            case "SHOW_TRIGGER_MESSAGE":
                this.screens.pushOverlay(OverlayScreenType.MESSAGE_LOG, { messages: [event.message] });
                break;

            // Overlay 操作
            case "PUSH_OVERLAY": await this.screens.pushOverlay(event.overlay, event.payload); break;
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
                        this.screens.pushOverlay(OverlayScreenType.SELECT_TARGET_OVERLAY, { skillId: TechniqueId.ATTACK, allies: [], enemies: event.payload.phaseBase.enemies, isTargetEnemy: true });
                        break;

                    case CommandActionType.TECHNIQUE:
                    case CommandActionType.MAGIC:
                        this.gameUseCases.battleCommandSelectedUseCase.execute(event.payload);
                        break;

                    case CommandActionType.ITEM:
                        this.screens.pushOverlay(OverlayScreenType.ITEM_SELECT_OVERLAY_IN_BATTLE, undefined);
                        break;

                    case CommandActionType.DEFENCE:
                        this.gameUseCases.battleInputUseCase.execute({ skillId: TechniqueId.GUARD, targetId: event.payload.phaseBase.actorInstanceId });
                        break;

                    case CommandActionType.ESCAPE:// すぐにコマンド処理を実行
                        this.gameUseCases.battleInputUseCase.execute({ skillId: TechniqueId.ESCAPE, targetId: event.payload.phaseBase.actorInstanceId });
                        break;
                }
                break;
            }

            case "SKILL_SELECTED":
                if (event.payload.target.type === TargetType.ALL_ALLIES || event.payload.target.type === TargetType.ALL_ENEMIES) {
                    this.emit({
                        type: "PLAYER_COMMAND_SELECTED",
                        input: {
                            skillId: event.payload.skillId ?? TechniqueId.ATTACK,
                            targetId: -1
                        }
                    });
                    break;
                }
                this.screens.pushOverlay(OverlayScreenType.SELECT_TARGET_OVERLAY, { skillId: event.payload.skillId, allies: event.payload.allies, enemies: event.payload.enemies, isTargetEnemy: event.payload.target.side === TargetSide.ENEMY ? true : false });
                break;

            case "BATTLE_ITEM_SELECTED": {
                // 道具選択を確定 => プレイヤー入力として戦闘ループへ。
                // 対象は ActionFactory 側で道具の targetType に応じて自動解決する(targetId=-1)。
                this.gameUseCases.battleInputUseCase.execute({
                    skillId: TechniqueId.ATTACK, // 道具使用時は itemId が優先されるためダミー
                    targetId: -1,
                    itemId: event.itemId,
                });
                break;
            }

            case "PLAYER_COMMAND_SELECTED": {
                this.gameUseCases.battleInputUseCase.execute(event.input);
                break;
            }

            case "SHOW_ALLIES_STATUS": {
                const alliesStatusOverlay = this.screens.getOverlayScreen(OverlayScreenType.ALLIES_STATUS_OVERLAY);
                alliesStatusOverlay.show(event.allies);
                break;
            }

            case "UPDATE_ALLIE_STATUS": {
                const alliesStatusOverlay = this.screens.getOverlayScreen(OverlayScreenType.ALLIES_STATUS_OVERLAY);
                alliesStatusOverlay.updateStatus?.(event.allies);
                break;
            }

            case "ADD_BATTLE_LOG": {
                this.gameUseCases.addBattleLogUseCase.execute(event.message);
                break;
            }
        }
    }
}
