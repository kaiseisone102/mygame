// src/renderer/ui/sliders/moveSliderFocus.ts
import { SliderUI } from "./sliderTypes";

/**
 * スライダーを上下に移動してフォーカス
 * @param sliders SliderUI の配列
 * @param currentIndex 現在のアクティブインデックス
 * @param delta 移動量 (-1:上, +1:下)
 * @returns 新しいアクティブインデックス
 */
export function moveSliderFocus(
    sliders: SliderUI[],
    currentIndex: number,
    delta: number
): number {
    const newIndex = Math.max(0, Math.min(sliders.length - 1, currentIndex + delta));
    const slider = sliders[newIndex];

    // フォーカスを input にセット
    slider.input.focus();

    // ジャンプ演出
    slider.wrapper.classList.remove("jump");
    void slider.wrapper.offsetWidth; // reflow
    slider.wrapper.classList.add("jump");

    return newIndex;
}
