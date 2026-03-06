// src/renderer/screens/overlayScreens/screen/controller/OptionsOverlayController.ts

import { audioManager } from "../../../../../renderer/asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "../../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { ScreenInitContext } from "../../../../../renderer/screens/interface/context/ScreenInitContext";
import { MainScreenController } from "../../../../../renderer/screens/interface/controller/MainScreenController";
import { UseUIAxesScreenController } from "../../../../../renderer/screens/interface/controller/UseUIAxesScreenController";
import { createSlider } from "../../../../../renderer/ui/sliders/createSlider";
import { moveSliderFocus } from "../../../../../renderer/ui/sliders/moveSliderFocus";
import { getActiveSliderUI, changeSliderUI } from "../../../../../renderer/ui/sliders/slider";
import { SliderUI } from "../../../../../renderer/ui/sliders/sliderTypes";
import { syncSliderUI } from "../../../../../renderer/ui/sliders/sliderUI";
import { GameConfig } from "../../../../../shared/config/GameConfig";
import { WorldEvent } from "../../../../../renderer/router/WorldEvent";

export class OptionsOverlayController implements MainScreenController, UseUIAxesScreenController {
    private screen!: HTMLElement;
    private emitUI!: (event: AppUIEvent) => void;
    private emitWorld!: (event: WorldEvent) => void;
    private ctx!: ScreenInitContext;
    private config!: GameConfig;

    private sliders: SliderUI[] = [];
    private activeIndex = 0;

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.ctx = initCtx;
        this.emitUI = this.ctx.emitUI;
        this.emitWorld = this.ctx.emitWorld;
        this.config = structuredClone(this.ctx.getConfig());

        // --------------------
        // DOM構築
        // --------------------
        this.screen = document.createElement("div");
        this.screen.className = "optionsOverlay";
        root.appendChild(this.screen);

        const container = document.createElement("div");
        container.id = "audio-options";
        this.screen.appendChild(container);

        // --------------------
        // Slider生成
        // --------------------
        const master = createSlider("Master", container, "master");
        const bgm = createSlider("BGM", container, "bgm");
        const se = createSlider("SE", container, "se");

        this.sliders = [master, bgm, se];

        master.input.value = String(this.config.masterVolume);
        bgm.input.value = String(this.config.bgmVolume);
        se.input.value = String(this.config.seVolume);

        syncSliderUI(master, true);
        syncSliderUI(bgm);
        syncSliderUI(se);
    }

    show(): void {
        this.screen.style.display = "block";
        this.sliders[this.activeIndex].input.focus();
        // 現在の設定を再読み込み（キャンセル対策）
        this.config = structuredClone(this.ctx.getConfig!());
    }

    hide(): void {
        this.screen.style.display = "none";
    }

    update(delta: number): void {
    }

    /**
     * Axis 操作処理
     */
    UIAxes(axes: InputAxis[]): void {
        const STEP = 0.1;

        for (const axis of axes) {
            const active = getActiveSliderUI(this.sliders);

            switch (axis) {
                case "UP":
                    this.activeIndex = moveSliderFocus(this.sliders, this.activeIndex, -1);
                    break;
                case "DOWN":
                    this.activeIndex = moveSliderFocus(this.sliders, this.activeIndex, 1);
                    break;
                case "LEFT":
                    this.changeSlider(active, -STEP);
                    break;
                case "RIGHT":
                    this.changeSlider(active, STEP);
                    break;
            }
            audioManager.playSE("assets/se/cursorMove.mp3")
        }
    }

    UIActions(events: UIActionEvent[]): void {
        for (const e of events) {
            switch (e.action) {
                case "CONFIRM":
                    this.confirm();
                    break;
                case "CANCEL":
                case "TEST_OPEN_OPTION":
                    this.cancel();
                    break;
            }
            console.log("OPTION_SCREEN", e.action)
        }
    }

    /**
     * スライダー値変更処理
     */
    private changeSlider(slider: SliderUI, delta: number): void {
        changeSliderUI(slider, delta, (volume) => {
            switch (slider.kind) {
                case "master":
                    this.config.masterVolume = volume;
                    audioManager.setMasterVolume(volume);
                    break;
                case "bgm":
                    this.config.bgmVolume = volume;
                    audioManager.setBgmVolume(volume);
                    break;
                case "se":
                    this.config.seVolume = volume;
                    audioManager.setSeVolume(volume);
            }
        });
    }

    /**
     * 設定確定
     */
    private confirm(): void {
        audioManager.playSE("assets/se/decide.mp3");
        this.emitWorld({ type: "SAVE_CONFIG", config: this.config });
    }

    /**
     * キャンセル
     */
    private cancel(): void {
        audioManager.playSE("assets/se/cancel.mp3");
        this.emitUI({ type: "POP_OVERLAY" });
    }
}