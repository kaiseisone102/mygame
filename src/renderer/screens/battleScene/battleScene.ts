// src/renderer/screens/battleScene/BattleScene.ts

import { BattleManager } from "../../../renderer/game/battle/core/BattleManager";
import { BattleBasicCommandOverlay } from "./overlayScreen/BattleBasicCommandOverlay";
import { BattleEnemyScreen } from "./mainScreen/BattleEnemyScreen";
import { MainScreen } from "../interface/screen/MainScreen";
import { ScreenInitContext } from "../interface/context/ScreenInitContext";
import { InputFrame } from "../../../renderer/input/frame/InputFrame";
import { InputAxis, UIActionEvent } from "../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../renderer/router/WorldEvent";
import { convertSkillResultToBattleEvents } from "../../../renderer/game/battle/event/convertSkillResultToBattleEvents";
import { BattleEventQueue } from "../../../renderer/game/battle/event/BattleEventQueue";
import { AttackTargetOverlay } from "./overlayScreen/AttackTargetOverlay";
import { BattleLogOverlay } from "./overlayScreen/BattleLogOverlay";
import { ItemSelectOverLayInBattle } from "./overlayScreen/ItemSelectOverLayInBattle";
import { MagicTargetOverlay } from "./overlayScreen/MagicTargetOverlay";
import { OverlayScreenType } from "../../../shared/type/screenType";
import { BattleBackgroundScreen } from "./mainScreen/BattleBackgroundScreen";
import { GetOverlayScreenType } from "../interface/overlay/OverLayScreens";
import { BattleEvent } from "../../../renderer/game/battle/event/BattleEvent";
import { BattleState } from "../../../renderer/game/battle/core/BattleState";

export type BattleScenePayload = {
    battleState: BattleState
};

/**
 * BattleScene
 * 
 * [責務]
 * - BattleManager を保持
 * - Battle Screen / Overlay を生成・初期化
 * - BattleState を各 Screen に配る
 * - UIイベントを解釈して Manager に渡す
 * - 勝敗時に WorldEvent を投げる
 */
export class BattleScene implements MainScreen<BattleScenePayload> {
    private initialState!: BattleState;
    private eventQueue!: BattleEventQueue;

    private emitWorld!: (event: WorldEvent) => void;
    private emitUI!: (event: AppUIEvent) => void;
    private emitBattle!: (e: { type: "BATTLE_EVENT_QUEUE"; event: BattleEvent }) => void;
    private battleState!: BattleState;

    private manager!: BattleManager;

    private enemyScreen!: BattleEnemyScreen;
    private backgroundScreen!: BattleBackgroundScreen;

    private screens!: (BattleEnemyScreen | BattleBackgroundScreen)[];

    private basicCommandOverlay!: BattleBasicCommandOverlay;
    private attackTargetOverlay!: AttackTargetOverlay;
    private magicTargetOverlay!: MagicTargetOverlay;
    private itemOverlay!: ItemSelectOverLayInBattle;
    private battleLog!: BattleLogOverlay;

    private battleOverlay!: (BattleBasicCommandOverlay | AttackTargetOverlay | MagicTargetOverlay | ItemSelectOverLayInBattle | BattleLogOverlay)[];

    private currentTurn!: number;
    private targetId!: number;

    constructor(
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
        this.attackTargetOverlay = this.overlays[OverlayScreenType.ATTACK_TARGET_OVERLAY];
        this.magicTargetOverlay = this.overlays[OverlayScreenType.MAGIC_TARGET_OVERLAY];
        this.itemOverlay = this.overlays[OverlayScreenType.ITEM_SELECT_OVERLAY_IN_BATTLE];
        this.battleLog = this.overlays[OverlayScreenType.BATTLE_LOG];

        this.battleOverlay = [this.battleLog, this.basicCommandOverlay, this.attackTargetOverlay, this.magicTargetOverlay, this.itemOverlay]

        this.getBattleState();
    }

    async show(payload: BattleScenePayload): Promise<void> {

        this.battleState = payload.battleState;
        this.currentTurn = payload.battleState.turn;

        this.battleLog.show();
        this.screens.forEach(s => s.show());
        this.syncState();
        // ゲームループ
        while (!this.manager.getState().finished) {
            console.log(this.currentTurn, "巡目");

            const results = await this.manager.nextStep();
            this.emitUI({ type: "POP_ALL_OVERLAY" })

            if (results) {
                console.log("results", results)

                this.syncState();

                const events = await convertSkillResultToBattleEvents(results);

                this.emitUI({ type: "INPUT_CONTROLL", lock: true })
                await this.eventQueue.play(events);
                this.emitUI({ type: "INPUT_CONTROLL", lock: false })

            }
            this.currentTurn++;
        }
        // 画面遷移の前にクリーンアップ
        this.cleanup()

        this.emitWorld({
            type: "BATTLE_RESULT",
            result: this.manager.getState().result
        });
    }

    hide(): void {
        this.screens.forEach(s => s.hide());
    }

    update(delta: number, frame: InputFrame) { }

    handleUIAxes(axes: InputAxis[]): boolean {
        this.basicCommandOverlay.handleUIAxes(axes);
        return true
    }

    handleUIActions(actions: UIActionEvent[]): boolean {
        this.basicCommandOverlay.handleUIActions(actions);
        return true
    }

    private syncState() {
        this.manager.setState(this.battleState);
        this.screens.forEach(s => s.setBattleState(this.battleState));
        //  this.battleOverlay.forEach(o => o.setBattleState(state)); overlay には payload で渡す
    }

    getBattleState(): BattleState {
        return this.manager.getState();
    }

    setTargetId(targetId: number) {
        this.targetId = targetId
    }

    private cleanup() {
        this.screens.forEach(s => s.hide());
        this.emitUI({ type: "POP_ALL_OVERLAY" });
        this.battleLog.hide();
        this.eventQueue.clear();
        this.currentTurn = 0;
        this.manager.reset();
    }
}