// src/renderer/screens/overlayScreens/screen/controller/interface/

import { UIActionEvent, InputAxis } from "../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../context/ScreenInitContext";
import { BaseScreenController } from "./BaseScreenController";

export interface UIScreenController extends BaseScreenController{
    UIActions(actions: UIActionEvent[]): void;
    UIAxis?(axes: InputAxis[]): void;

    update?(delta: number): void;
}

export interface YesNoOverlayController {
    init(root: HTMLElement, ctx: ScreenInitContext): void;
    show(): void;
    hide(): void;
    UIActions(actions: UIActionEvent[]): void;
    UIAxis(axes: InputAxis[]): void;
    update(delta: number): void;
}