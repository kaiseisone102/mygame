// src/renderer/screens/overlayScreens/screen/controller/interface/

import { ScreenInitContext } from "../context/ScreenInitContext";

export interface BaseScreenController<T = void> {
    init(root: HTMLElement, ctx: ScreenInitContext): void;
    show(payload: T): void;
    hide(): void;
}