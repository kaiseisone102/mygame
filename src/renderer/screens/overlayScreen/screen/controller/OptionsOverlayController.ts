// src/renderer/screens/overlayScreens/screen/controller/OptionsOverlayController.ts

import { SliderKind, SliderUI } from "renderer/ui/interface/option/SliderKind";
import { audioManager } from "../../../../../renderer/asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "../../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../../renderer/router/WorldEvent";
import { ScreenInitContext } from "../../../../../renderer/screens/interface/context/ScreenInitContext";
import { GameConfig } from "../../../../../shared/config/GameConfig";
import { BaseScreenController } from "renderer/screens/interface/controller/BaseScreenController";

export class OptionsOverlayController implements BaseScreenController {
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

        // --------------------
        // DOM構築
        // --------------------
        this.screen = document.createElement("div");
        this.screen.className = "optionsOverlay";
        root.appendChild(this.screen);

        const container = document.createElement("div");
        container.id = "audio-options";
        this.screen.appendChild(container);

        // スライダー生成（順序が index と一致）
        this.sliders = [
            this.createSlider("Master Volume", container, "master"),
            this.createSlider("BGM Volume", container, "bgm"),
            this.createSlider("SE Volume", container, "se")
        ];

        this.updateFocusUI();
    }

    show(): void {
        this.screen.style.display = "block";
        // 最新の設定を取得
        this.config = structuredClone(this.ctx.getConfig!());

        // 各スライダーの値を同期
        this.sliders.forEach(s => {
            const val = this.getConfigValueByKind(s.kind); // ヘルパー関数
            s.input.value = String(val);// input要素(0.0~1.0)を更新
            this.syncSliderUI(s);// 見た目（バーの長さやVOL.XXテキスト）を更新
        });

        this.updateFocusUI();
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
        const count = this.sliders.length;

        for (const axis of axes) {
            switch (axis) {
                case "UP":
                    this.activeIndex = (this.activeIndex - 1 + count) % count;
                    this.updateFocusUI();
                    audioManager.playSE("assets/se/cursorMove.mp3");
                    break;
                case "DOWN":
                    this.activeIndex = (this.activeIndex + 1) % count;
                    this.updateFocusUI();
                    audioManager.playSE("assets/se/cursorMove.mp3");
                    break;
                case "LEFT":
                    this.changeSlider(this.sliders[this.activeIndex], -STEP);
                    break;
                case "RIGHT":
                    this.changeSlider(this.sliders[this.activeIndex], STEP);
                    break;
            }
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
     * インデックスに基づきUIのフォーカス状態を一括更新
     */
    private updateFocusUI() {
        this.sliders.forEach((s, i) => {
            const isFocused = i === this.activeIndex;
            s.wrapper.classList.toggle("selected", isFocused);

            if (isFocused) {
                s.input.focus();
                // P5風：選択された瞬間に少し跳ねる演出
                s.wrapper.classList.remove("jump");
                void s.wrapper.offsetWidth;
                s.wrapper.classList.add("jump");
            }
        });
    }

    private changeSlider(slider: SliderUI, delta: number): void {
        const current = Number(slider.input.value);
        const next = Math.max(0, Math.min(1, Math.round((current + delta) * 10) / 10));

        // 値が実際に変わる場合のみ処理
        if (current !== next) {
            slider.input.value = next.toFixed(1);

            // 音量反映
            const vol = next;
            if (slider.kind === "master") { this.config.masterVolume = vol; audioManager.setMasterVolume(vol); }
            if (slider.kind === "bgm") { this.config.bgmVolume = vol; audioManager.setBgmVolume(vol); }
            if (slider.kind === "se") { this.config.seVolume = vol; audioManager.setSeVolume(vol); }

            this.flashSlider(slider); // 数値が変わった時の閃光演出
            this.syncSliderUI(slider);
            audioManager.playSE("assets/se/cursorMove.mp3"); // 値変更時も軽く鳴らす
        } else {
            this.shakeScreen(slider.wrapper); // 限界値で入力した時の抵抗演出
        }
    }

    /**
     * 設定確定
     */
    private confirm(): void {
        audioManager.playSE("assets/se/decide.mp3");

        this.emitUI({ type: "SAVE_CONFIG", config: this.config });
        this.emitUI({ type: "POP_OVERLAY" });
    }

    /**
     * キャンセル
     */
    private cancel(): void {
        audioManager.playSE("assets/se/cancel.mp3");
        this.emitUI({
            type: "OPEN_YES_NO",
            message: `完全に保存しないで戻る?`,
            onYes: () => {
                this.emitUI({ type: "POP_OVERLAY" });
                this.emitUI({ type: "POP_OVERLAY" });
            },
            onNo: () => this.emitUI({ type: "POP_OVERLAY" })
        });

    }

    private createSlider(labelText: string, parent: HTMLElement, kind: SliderKind,): SliderUI {
        const wrapper = document.createElement("div");
        wrapper.className = "slider";

        const label = document.createElement("label");
        label.className = "slider-label";
        label.textContent = labelText;

        const bar = document.createElement("div");
        bar.className = "slider-bar";

        const fill = document.createElement("div");
        fill.className = "slider-fill";

        const knob = document.createElement("div");
        knob.className = "slider-knob";

        const valueText = document.createElement("div");
        valueText.className = "slider-value";
        valueText.textContent = "VOL.05";

        bar.appendChild(fill);
        bar.appendChild(knob);

        const input = document.createElement("input");
        input.type = "range";
        input.min = "0";
        input.max = "1";
        input.step = "0.1";
        input.tabIndex = 0;
        input.className = "slider-input";

        wrapper.append(label, bar, input, valueText);
        parent.appendChild(wrapper);

        return { kind, input, fill, knob, valueText, wrapper, };
    }

    /**
     * SliderUI の表示を input.value に同期
     */
    private syncSliderUI(slider: SliderUI) {
        const value = Number(slider.input.value);
        const percent = value * 100;

        slider.fill.style.width = `${percent}%`;
        slider.knob.style.left = `calc(${percent}% - 10px)`;

        // P5風：1.0(MAX)の時だけ色を変えるためのクラス
        slider.wrapper.classList.toggle("is-max", value >= 1);

        slider.valueText.textContent = value >= 1 ? "MAX" : Math.round(value * 100).toString();
    }
    /**
     * フラッシュ演出を追加する
     */
    private flashSlider(slider: SliderUI) {
        const flash = document.createElement("div");
        flash.className = "slider-flash";
        slider.wrapper.appendChild(flash);
        setTimeout(() => flash.remove(), 150);
    }

    private shakeScreen(screen: HTMLElement | null) {
        if (!screen) return;
        screen.classList.remove("shake");
        void screen.offsetWidth;
        screen.classList.add("shake");
    }

    /**
 * スライダーの種類に応じて現在のコンフィグ値を返す
 */
    private getConfigValueByKind(kind: SliderKind): number {
        switch (kind) {
            case "master":
                return this.config.masterVolume;
            case "bgm":
                return this.config.bgmVolume;
            case "se":
                return this.config.seVolume;
            default:
                return 0.5; // 万が一のフォールバック
        }
    }
}