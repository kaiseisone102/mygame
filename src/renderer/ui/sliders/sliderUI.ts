// src/renderer/ui/sliders/sliderUI.ts
import { SliderUI } from "./sliderTypes";

/**
 * SliderUI の表示を input.value に同期
 */
export function syncSliderUI(slider: SliderUI, isMaster = false) {
    const value = Number(slider.input.value); // 0〜1
    const percent = value * 100;

    slider.fill.style.width = `${percent}%`;
    slider.knob.style.left = `calc(${percent}% - 7px)`; // knob幅半分
    // MAX 表示文字
    slider.valueText.textContent = value >= 1
        ? "VOL.MAX"
        : `VOL.${Math.round(value * 10).toString().padStart(2, "0")}`;
    // MAX 判定クラス
    slider.wrapper.classList.toggle("is-max", value >= 1);
    slider.wrapper.classList.toggle("is-master", isMaster);
    
}
/**
 * フラッシュ演出を追加する
 */
export function flashSlider(slider: SliderUI) {
    const flash = document.createElement("div");
    flash.className = "slider-flash";
    slider.wrapper.appendChild(flash);
    setTimeout(() => flash.remove(), 150);
}