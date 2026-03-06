// src/renderer/ui/sliders/createSlider.ts
import { SliderKind, SliderUI } from "./sliderTypes";

/**
 * スライダー生成
 */
export function createSlider(
    labelText: string,
    parent: HTMLElement,
    kind: SliderKind,
): SliderUI {
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

    return {
        kind,
        input,
        fill,
        knob,
        valueText,
        wrapper,
    };
}