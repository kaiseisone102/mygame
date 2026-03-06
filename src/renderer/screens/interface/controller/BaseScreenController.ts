// src/renderer/screens/overlayScreens/screen/controller/interface/

import { ScreenInitContext } from "../context/ScreenInitContext";

export interface BaseScreenController {
    init(root: HTMLElement, ctx: ScreenInitContext): void;
    show(): void;
    hide(): void;
}