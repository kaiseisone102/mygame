// // src/renderer/screens/interface/screen/BaseScreen.ts

import { InputAxis, UIActionEvent } from "@/renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "@/renderer/screens/interface/context/ScreenInitContext";

export interface BaseScreen {
    init(root: HTMLElement, ctx: ScreenInitContext): void;
    show(): void;
    hide(): void;
    handleUIActions(actions: UIActionEvent[]): boolean;
    handleUIAxes(axes: InputAxis[]): boolean;
}