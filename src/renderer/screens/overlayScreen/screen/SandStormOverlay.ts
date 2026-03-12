// src/renderer/screens/overlayScreens/screen/SandStormOverlay.ts

import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";

export class SandStormOverlay implements OverlayScreen<void> {

    readonly overlayId: string = OverlayScreenType.SANDSTORMOVERLAY;
    readonly capturesInput: boolean = false;

    private screen!: HTMLElement;
    private crescent!: HTMLElement;

    init(root: HTMLElement, ctx: ScreenInitContext): void {
        this.screen = document.createElement("div");
        this.screen.classList = "sand-Storm-Overlay";
        root.appendChild(this.screen);

        this.crescent = document.createElement("div");
        this.crescent.classList.add("crescent");
        this.screen.appendChild(this.crescent);
    }

    show(payload: void): void { this.screen.style.display = "block" }

    hide(): void { this.screen.style.display = "none" }

    update(delta: number): void { }

    handleUIActions(actions: UIActionEvent[]): boolean { return true }

    handleUIAxes(axes: InputAxis[]): boolean { return true }
}