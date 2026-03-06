// src/renderer/ui/sliders/sliderUI.ts

import { SliderUI } from "./sliderTypes";
import { flashSlider, syncSliderUI } from "./sliderUI";
import { changeSliderValue } from "./sliderValue";

/**
 * 便利関数：値変更 + フラッシュ
 */
export function changeSliderUI(
    slider: SliderUI,
    delta: number,
    onChange?: (nextValue: number) => void,
    withFlash = true,
    isMaster = false,
) {
    const next = changeSliderValue(slider, delta, onChange);
    if (withFlash) flashSlider(slider);
    syncSliderUI(slider, isMaster);
    return next;
}

/**
 * 現在アクティブなスライダーを取得
 * @param sliders SliderUI の配列
 * @param fallbackIndex アクティブなスライダーがない場合のデフォルト
 */
export function getActiveSliderUI(sliders: SliderUI[], fallbackIndex = 0): SliderUI {
    const active = document.activeElement;
    // inputが現在フォーカスされているスライダーに属するか確認
    for (const slider of sliders) {
        if (slider.input === active) {
            return slider;
        }
    }
    // デフォルト
    return sliders[fallbackIndex];
}
