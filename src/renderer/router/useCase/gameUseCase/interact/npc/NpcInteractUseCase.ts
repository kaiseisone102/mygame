// src/renderer/router/useCase/interact/npc/NpcInteractUseCase.ts

import { ScreenPort } from "../../../../../../renderer/port/ScreenPort";
import { OverlayScreenType } from "../../../../../../shared/type/screenType";

export class NpcInteractUseCase {

    constructor(private screen: ScreenPort) { }

    execute(event: any) {
        this.screen.pushOverlay(OverlayScreenType.MESSAGE_LOG, event.message);
    }
}
