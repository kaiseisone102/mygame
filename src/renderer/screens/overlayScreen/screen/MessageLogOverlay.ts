// src/renderer/screens/overlayScreens/screen/MessageLogOverlay.ts

import { OverlayScreenType } from "../../../../shared/type/screenType";
import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { MessageLogOverlayController } from "./controller/MessageLogOverlayController";
import { MessageLogOverlayScreen } from "../../interface/overlay/OverLayScreens";

export type MessageLogEvent = {
    messages: string[],
}

export class MessageLogOverlay implements MessageLogOverlayScreen {
    readonly overlayId: string = OverlayScreenType.MESSAGE_LOG;

    readonly capturesInput: true = true;

    private controller!: MessageLogOverlayController;

    /**
     * 初期化
     */
    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.controller = new MessageLogOverlayController();
        this.controller.init(root, initCtx);
        this.hide();
        console.log("[MessageLogOverlay] done init")
    }

    /**
     * 表示
     */
    async show(payload: MessageLogEvent): Promise<void> {
        return this.controller.show(payload);
    }

    /**
     * 非表示
     */
    hide(): void {
        this.controller.hide();
    }

    update(delta: number): void {
        this.controller.update(delta);
    }

    pause() {

    }

    resume() {

    }

    handleUIAxes(axes: InputAxis[]): boolean {
        this.controller.UIAxes(axes);
        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        this.controller.UIActions(events)
        return true;
    }
}
