// src/renderer/router/useCase/interact/npc/ReadSignUseCase.ts

import { ScreenPort } from "../../../../../../renderer/port/ScreenPort";
import { OverlayScreenType } from "../../../../../../shared/type/screenType";

export class ReadSignUseCase {

    constructor(private screen: ScreenPort) { }

    execute(event: any) {
        this.screen.pushOverlay(OverlayScreenType.MESSAGE_LOG, event.message);
    }
}