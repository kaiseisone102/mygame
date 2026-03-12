// src/renderer/screens/battleScene/BattleScene.ts

import { delay } from "../../../renderer/utils/delay";
import { GameState } from "../../../shared/data/gameState";
import { GrowTableJson } from "../../../shared/Json/growTable/growTableJson";
import { BiomeId } from "../../../shared/type/battle/enemy/BiomeId";
import { BattleResult, CommandMode } from "../../../shared/type/battle/TargetType";
import { OverlayScreenType } from "../../../shared/type/screenType";
import { BattleManager } from "../../game/battle/core/BattleManager";
import { Battler } from "../../game/battle/core/Battler";
import { BattleState } from "../../game/battle/core/BattleState";
import { BattleEvent } from "../../game/battle/event/BattleEvent";
import { BattleEventQueue } from "../../game/battle/event/BattleEventQueue";
import { convertSkillResultToBattleEvents } from "../../game/battle/event/convertSkillResultToBattleEvents";
import { BattleResultService } from "../../game/battle/service/BattleResultService";
import { InputFrame } from "../../input/frame/InputFrame";
import { InputAxis, UIActionEvent } from "../../input/mapping/InputMapper";
import { AppUIEvent } from "../../router/AppUIEvents";
import { WorldEvent } from "../../router/WorldEvent";
import { ScreenInitContext } from "../interface/context/ScreenInitContext";
import { GetOverlayScreenType } from "../interface/overlay/OverLayScreens";
import { MainScreen } from "../interface/screen/MainScreen";
import { BattleBackgroundScreen } from "./mainScreen/BattleBackgroundScreen";
import { BattleEnemyScreen } from "./mainScreen/BattleEnemyScreen";
import { BattleBasicCommandOverlay } from "./overlayScreen/BattleBasicCommandOverlay";
import { BattleLogOverlay } from "./overlayScreen/BattleLogOverlay";
import { BattleTurnDisplayOverlay } from "./overlayScreen/BattleTurnDisplayOverlay";
import { LevelUpOverlay } from "./overlayScreen/LevelUpOverlay";

export type BattleScenePayload = {
    allies: Battler[];
    enemies: Battler[];
    biomeId: BiomeId;
};

/**
 * BattleScene
 * 
 * [責務]
 * - Battle Screen / Overlay を生成・初期化
 * - BattleState を各 Screen に配る
 * - UIイベントを解釈して router に渡す
 * - 勝敗時に WorldEvent を投げる
 */
export class BattleScene implements MainScreen<BattleScenePayload> {
    private processing!: boolean;
    private resultProcessing!: boolean;

    private eventQueue!: BattleEventQueue;

    private emitWorld!: (event: WorldEvent) => void;
    private emitUI!: (event: AppUIEvent) => void;
    private emitBattle!: (e: { type: "BATTLE_EVENT_QUEUE"; event: BattleEvent }) => void;

    private manager!: BattleManager;
    private resultService!: BattleResultService;

    private enemyScreen!: BattleEnemyScreen;
    private backgroundScreen!: BattleBackgroundScreen;

    private screens!: (BattleEnemyScreen | BattleBackgroundScreen)[];

    private basicCommandOverlay!: BattleBasicCommandOverlay;
    private battleLog!: BattleLogOverlay;
    private battleTurnDisplay!: BattleTurnDisplayOverlay;
    private levelUpOverlay!: LevelUpOverlay;

    constructor(
        private gameState: GameState,
        private allyGrowTable: GrowTableJson,
        private initManager: BattleManager,
        private initEnemyScreen: BattleEnemyScreen,
        private initBackgroundScreen: BattleBackgroundScreen,
        private overlays: GetOverlayScreenType,
    ) { }

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.emitWorld = initCtx.emitWorld;
        this.emitUI = initCtx.emitUI;
        this.emitBattle = initCtx.emitBattle;

        this.eventQueue = new BattleEventQueue(this.emitBattle);
        this.manager = this.initManager;

        this.enemyScreen = this.initEnemyScreen;
        this.backgroundScreen = this.initBackgroundScreen;

        this.screens = [this.enemyScreen, this.backgroundScreen];

        this.basicCommandOverlay = this.overlays[OverlayScreenType.BATTLE_BASIC_COMMAND_OVERLAY];
        this.battleLog = this.overlays[OverlayScreenType.BATTLE_LOG];
        this.battleTurnDisplay = this.overlays[OverlayScreenType.BATTLE_TURN_DISPLAY];
        this.levelUpOverlay = this.overlays[OverlayScreenType.LEVEL_UP_OVERLAY];
    }

    // ----- ----- ----- ----- //
    // initialize display      //
    // ----- ----- ----- ----- //
    async show(payload: BattleScenePayload): Promise<void> {

        this.processing = false;
        this.resultProcessing = false;

        this.manager.init({ turn: 1, allies: payload.allies, enemies: payload.enemies, currentActorId: 999, order: [], actionQueue: [], result: BattleResult.NULL, finished: false, mode: CommandMode.NULL, });

        // guard: no enemy
        // if (payload.enemies.length === 0) {
        //     this.emitWorld({ type: "BATTLE_RESULT", result: BattleResult.WIN });
        //     return;
        // }

        this.manager.startBattle();

        this.resultService = new BattleResultService(
            this.gameState,
            this.allyGrowTable,
            this.manager
        );

        this.battleLog.show();
        this.battleLog.addLog(`A group of monsters appered!`);
        this.battleTurnDisplay.show({ currentTurn: 1 });
        this.enemyScreen.show();
        this.backgroundScreen.show(payload.biomeId);

        this.syncState();
    }

    hide(): void {
        this.screens.forEach(s => s.hide());
    }

    // called every frame from screenManager 
    async update(delta: number, frame: InputFrame) {

        // ignore that, in processing
        if (this.processing || this.resultProcessing) return;

        // ----- ----- //
        // combat loop //
        // ----- ----- //
        if (!this.manager.getState().finished) {

            this.processing = true;

            try {
                const results = await this.manager.nextStep();
                this.emitUI({ type: "POP_ALL_OVERLAY" })

                if (results) {
                    console.log("results", results)

                    const events = await convertSkillResultToBattleEvents(results);

                    this.emitUI({ type: "INPUT_CONTROLL", lock: true })
                    try {
                        await this.eventQueue.play(events);
                    } finally {
                        this.emitUI({ type: "INPUT_CONTROLL", lock: false })
                    }

                    this.syncState();
                }
            } finally {
                this.processing = false;
            }
        }

        // ----- ----- ----- //
        // finish process    //
        // ----- ----- ----- //
        else {
            this.resultProcessing = true;

            const battleResult = await this.manager.checkBattleEndAfterStep();

            if (battleResult !== BattleResult.NULL) {

                if (battleResult === BattleResult.WIN) {

                    // Distribute EXP to ally, check for level-ups
                    const resultData = this.resultService.process(battleResult);

                    await this.battleLog.playExpLogs(resultData.expLogs);
                    await delay(1000);

                    if (resultData.levelUps.length > 0) await this.levelUpOverlay.show(resultData.levelUps);

                }
                // Note its position
                this.cleanup();

                this.emitWorld({ type: "BATTLE_RESULT", result: battleResult });
            }
        }
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        if (this.processing && !this.resultProcessing) {
            this.basicCommandOverlay.handleUIAxes(axes);
        } else if (!this.processing && this.resultProcessing) {
            this.levelUpOverlay.handleUIAxes(axes);
        }
        return true
    }

    handleUIActions(actions: UIActionEvent[]): boolean {
        if (this.processing && !this.resultProcessing) {
            this.basicCommandOverlay.handleUIActions(actions);
        } else if (!this.processing && this.resultProcessing) {
            this.levelUpOverlay.handleUIActions(actions);
        }
        return true
    }

    private syncState() {
        const state = this.manager.getState();
        this.screens.forEach(s => s.setBattleState(state));
        this.battleTurnDisplay.update(state.turn);
        console.log("[BattleScene]syncState:", state);
    }

    getBattleState(): BattleState {
        return this.manager.getState();
    }

    private cleanup() {
        this.screens.forEach(s => s.hide());
        this.battleLog.hide();
        this.emitUI({ type: "POP_ALL_OVERLAY" });
        this.battleTurnDisplay.hide();
        this.eventQueue.clear();
        this.manager.reset();
    }
}
