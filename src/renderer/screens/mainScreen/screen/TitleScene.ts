// src/renderer/screens/mainScreen/screen/TitleScene.ts

import { InputFrame } from "../../../../renderer/input/frame/InputFrame";
import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../renderer/router/WorldEvent";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { GetOverlayScreenType } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { MainScreen } from "../../../../renderer/screens/interface/screen/MainScreen";
import { SandStormOverlay } from "../../../../renderer/screens/overlayScreen/screen/SandStormOverlay";
import { OverlayScreenType } from "../../../../shared/type/screenType";

/**
 * TitleScene
 * 
 * [責務]
 * - Title Screen / Overlay を生成・初期化
 */
export class TitleScene implements MainScreen<void> {
    private emitWorld!: (event: WorldEvent) => void;
    private emitUI!: (event: AppUIEvent) => void;

    private sandStorm!: SandStormOverlay;


    constructor(
        private overlays: GetOverlayScreenType,
    ) { }

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.emitWorld = initCtx.emitWorld;
        this.emitUI = initCtx.emitUI;

        this.sandStorm = this.overlays[OverlayScreenType.SANDSTORM_OVERLAY];
    }

    // ----- ----- ----- ----- //
    // initialize display      //
    // ----- ----- ----- ----- //
    show(payload: undefined): void {
        this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.SANDSTORM_OVERLAY, payload: undefined });
        this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.TITLE_OVERLAY, payload: undefined });
    }

    hide(): void {
        this.cleanup();
    }

    // called every frame from screenManager 
    async update(delta: number, frame: InputFrame) {

    }

    handleUIAxes(axes: InputAxis[]): boolean {
        return true
    }

    handleUIActions(actions: UIActionEvent[]): boolean {
        return true
    }

    private cleanup() {
         this.emitUI({ type: "POP_ALL_OVERLAY" });
    }
}
