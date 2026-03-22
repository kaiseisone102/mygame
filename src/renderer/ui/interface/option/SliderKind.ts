// src/renderer/ui/interface/option/sliderTypes.ts
export type SliderKind = "master" | "bgm" | "se";

export interface SliderUI {
    kind: SliderKind; 
    input: HTMLInputElement;
    fill: HTMLElement;
    knob: HTMLElement;
    valueText: HTMLElement;
    wrapper: HTMLElement;
}
