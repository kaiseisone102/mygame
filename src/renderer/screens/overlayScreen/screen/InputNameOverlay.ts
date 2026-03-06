// src/renderer/screens/mainScreens/screen/NameInputScreen.ts

import { InputAxis, UIActionEvent } from "../../../input/mapping/InputMapper";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { InputNameOverlayController } from "./controller/InputNameOverlayController";
import { OverlayScreen } from "../../interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";

export class InputNameOverlay implements OverlayScreen {
    readonly overlayId: string = OverlayScreenType.INPUT_NAME_OVERLAY;

    readonly capturesInput = true;
    readonly capturesTextInput = true;

    private controller!: InputNameOverlayController;

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.controller = new InputNameOverlayController;
        this.controller.init(root, initCtx);
        this.hide();
        console.log("[InputNameScreen] done init")
    }

    show() {
        this.controller.show();
    }

    hide() {
        this.controller.hide();
    }

    update(delta: number): void { }

    handleUIAxes(axes: InputAxis[]): boolean {
        return true;
    };

    handleTextInput(chars: string[]) {
        this.controller.handleTextInput(chars);
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        this.controller.UIActions(events);
        return true;
    }
}

