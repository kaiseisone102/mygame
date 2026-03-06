// src/renderer/ui/sliders/sliderValues.ts
import { SliderUI } from "./sliderTypes";
import { syncSliderUI } from "./sliderUI";

/**
 * SliderUI の値を delta だけ増減し、表示とフラッシュを更新する
 * @param slider 操作対象
 * @param delta 増減値（-0.1〜0.1など）
 * @param onChange 値が変化したときに呼ばれるコールバック (nextValue:number) => void
 */

// 値を変更して表示を同期する
export function changeSliderValue(
    slider: SliderUI,
    delta: number,
    onChange?: (nextValue: number) => void,
    isMaster = false
) {
    const current = Number(slider.input.value);
    const next = Math.max(0, Math.min(1, current + delta));

    slider.input.value = next.toFixed(1);

    // コールバックで通知（音量更新など）
    onChange?.(next);

    // UI同期（フラッシュなし）
    syncSliderUI(slider, isMaster);

    return next;
}