// src/renderer/screens/ScreenManager.ts

import { WorldDefinition } from "../game/map/builder/interface/definition/WorldDefinition";
import type { ScreenInitContext } from "../../renderer/screens/interface/context/ScreenInitContext";
import { defaultGameConfig, GameConfig } from "../../shared/config/GameConfig";
import { GameState } from "../../shared/data/gameState";
import { YesNoEvent } from "../../shared/events/ui/YesNoEvent";
import { MainScreenType, OverlayScreenType } from "../../shared/type/screenType";
import { InputFrame } from "../input/frame/InputFrame";
import { InputSystem } from "../input/InputSystem";
import { ScreenPort } from "../port/ScreenPort";
import { ScreenStateReader } from "../save/query/ScreenQueryService";
import { OverlayInstanceMap, OverlayPayloadMap } from "./interface/overlay/overlayPayloadMap";
import { OverlayScreen } from "./interface/overlay/OverLayScreens";
import type { MainScreen } from "./interface/screen/MainScreen";
import { MainScreenInstanceMap, MainScreenPayloadMap } from "./interface/screen/MainScreenPayloadMap";
import { ZoneController } from "../../renderer/game/map/zone/ZoneController";

/**
 * 01/17/26
 * ScreenManager
 *
 * 役割:
 * - メイン画面(MainScreen)とOverlayの構造管理
 * - 入力(InputFrame)の振り分け
 *
 * やらないこと:
 * - ゲームロジック
 * - 状態更新
 * - UseCase 呼び出し
 * - WorldEvent の解釈
 */
export class ScreenManager implements ScreenPort, ScreenStateReader {
    // 現在表示中のMainScreen
    private mainScreen: MainScreen<unknown> | null = null;
    // 重なっているOverlay
    private overlayStack: OverlayScreen<unknown>[] = [];
    // 各画面に渡す共通コンテキスト
    private ctx: ScreenInitContext;
    // 設定
    private config: GameConfig = structuredClone(defaultGameConfig);
    // 入力ロック状態
    private inputLocked = false;

    constructor(
        private root: HTMLElement,
        private mainScreens: MainScreenInstanceMap,
        private overlayRegistry: OverlayInstanceMap,
        private initCtx: ScreenInitContext,
        private gameState: GameState,
        private inputSystem: InputSystem,
    ) {
        console.log(
            "[GameState injected]",
            gameState,
            gameState instanceof GameState
        );
        this.ctx = initCtx;
    }
    /**
     * すべての画面を初期化
     */
    async initAllScreens() {
        for (const screen of Object.values(this.mainScreens)) {
            await screen.init(this.root, this.ctx);
            await screen.hide();
        }
        for (const overlay of Object.values(this.overlayRegistry)) {
            await overlay.init(this.root, this.ctx);
            await overlay.hide();
        }
    }

    /**
     * 毎フレーム更新
     * - Overlayが1枚以上あればMainScreenは停止
     */
    update(delta: number, frame: InputFrame) {
        if (!this.mainScreen) return;

        const topOverlay = this.overlayStack.at(-1);

        // 1フレーム分の入力を取得
        const overlayCapturesInput = topOverlay?.capturesInput ?? false;

        if (topOverlay?.capturesTextInput) {
            this.inputSystem.enableTextInput();
        } else {
            this.inputSystem.disableTextInput();
        }

        if (this.inputLocked) {
            frame = InputFrame.empty();
            this.overlayStack.forEach(o => o.setEnabled?.(false));
        } else {
            this.overlayStack.forEach(o => o.setEnabled?.(true));
        }

        // ========= MainScreen =========
        this.mainScreen.update?.(
            delta,
            overlayCapturesInput ? InputFrame.empty() : frame
        );

        // ========= Overlay =========
        for (const overlay of this.overlayStack) {
            overlay.update?.(delta);
        }

        // ========= Input dispatch =========
        if (topOverlay) {
            // --- UI AXIS ---
            topOverlay.handleUIAxes?.(frame.uiAxisIntents);
            if (!overlayCapturesInput) {
                this.mainScreen.handleUIAxes?.(frame.uiAxisIntents);
            }

            // UI ACTION
            topOverlay.handleUIActions(frame.uiActions);
            if (!overlayCapturesInput) {
                this.mainScreen.handleUIActions(frame.uiActions);
            }
        } else {
            // Overlay がなければ全て MainScreen に
            this.mainScreen.handleUIAxes?.(frame.uiAxisIntents);
            this.mainScreen.handleUIActions(frame.uiActions);
        }

        // ========= GAME ACTION / AXIS dispatch =========
        if (!overlayCapturesInput) {
            this.mainScreen.handleGameActions?.(frame.gameActions);
            this.mainScreen.handleGameAxis?.(frame.gameAxisIntents);
        }

        // ========= TEXT INPUT dispatch =========
        if (topOverlay?.capturesTextInput) {
            const textChars = this.inputSystem.consumeTextInput?.() ?? [];

            if (textChars.length > 0) {
                topOverlay?.handleTextInput?.(textChars);
            }
        }
    }

    /**
     * MainScreen切替
     */
    changeMain<K extends keyof MainScreenInstanceMap>(type: K, payload: MainScreenPayloadMap[K]) {

        this.mainScreen?.hide?.();

        // Overlay 全破棄
        while (this.overlayStack.length > 0) {
            this.overlayStack.pop()?.hide?.();
        }
        const screen = this.mainScreens[type];
        // 新しい MainScreen を現在の MainScreen に
        this.mainScreen = screen;
        // 新しい MainScreen を表示
        screen.show(payload);

        this.inputSystem.reset();
        console.log("CHANGE_TO:", type)
    }

    /**
     * Overlay を表示
     */
    pushOverlay<K extends keyof OverlayInstanceMap>(type: K, payload: OverlayPayloadMap[K]) {
        this.inputSystem.reset();

        const current = this.overlayStack.at(-1);
        current?.pause?.();

        const overlay = this.overlayRegistry[type];

        this.overlayStack.push(overlay);
        overlay.show(payload);

        console.log("[Overlay PUSH]:| depth:", this.overlayStack.length, "| top:", this.overlayStack.at(-1)?.overlayId);
    }

    /**
     * Overlay を非表示
     */
    popOverlay() {
        const top = this.overlayStack.pop();
        //this.inputSystem.reset();
        top?.hide?.();

        // 下に Overlay が残っていれば再表示（フォーカス復帰）
        const next = this.activeOverlay;
        next?.resume?.();

        console.log("[Overlay POP]| depth:", this.overlayStack.length, "| top:", this.overlayStack.at(-1)?.overlayId);
    }

    popAllOverlay() {
        while (this.overlayStack.length > 0) {
            const screen = this.overlayStack.pop();
            screen?.hide?.();
            console.log("[Overlay ALL POP]", screen?.overlayId ?? "unknown", "| depth:", this.overlayStack.length);
        }
    }

    get activeOverlay(): OverlayScreen<unknown> | undefined {
        return this.overlayStack[this.overlayStack.length - 1];
    }

    setContext(ctx: ScreenInitContext) {
        this.ctx = ctx;
    }

    openYesNo(event: YesNoEvent) {
        this.inputSystem.reset();

        this.pushOverlay(OverlayScreenType.YES_NO_OVERLAY, event);
    }

    getActiveOverlayType(): string | null {
        return this.activeOverlay?.constructor.name ?? null;
    }

    /**
     * Overlay のコントローラを取得
     * @param type OverlayScreenType
     */
    getOverlayScreen<K extends keyof OverlayInstanceMap>(type: K): OverlayInstanceMap[K] {
        return this.overlayRegistry[type];
    }

    // 現在のワールドに差し替える
    setWorld(screenType: MainScreenType, def: WorldDefinition, zoneController: ZoneController) {
        this.mainScreens[screenType].setWorld?.(def, zoneController);
    }

    getMainScreen<K extends keyof MainScreenInstanceMap>(type: K): MainScreenInstanceMap[K] {
        return this.mainScreens[type];
    }

    /**
     * 指定した Overlay がすでに開いているか
     */
    isOverlayOpen(type: OverlayScreenType): boolean {
        return this.overlayStack.some(
            overlay => overlay === this.overlayRegistry[type]
        );
    }

    lockInput(lock: boolean) {
        this.inputLocked = lock;

        if (lock) {
            this.inputSystem.reset();
        }
    }

}
