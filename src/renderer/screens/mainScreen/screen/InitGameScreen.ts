// src/renderer/screens/mainScreens/screen/InitGameScreen.ts

import { InputAxis, UIActionEvent } from "@/renderer/input/mapping/InputMapper";
import { WorldEvent } from "@/renderer/router/WorldEvent";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { UseUIActionScreen } from "../../interface/screen/UseUIActionScreen";
import { InitGameScreenController } from "./controller/InitGameScreenController";

export class InitGameScreen implements UseUIActionScreen {
    private controller!: InitGameScreenController;

    private root!: HTMLElement;
    private ctx!: ScreenInitContext;
    private started = false;

    init(root: HTMLElement, initCtx: ScreenInitContext): void {

        this.root = root;
        this.ctx = initCtx;

        this.root.innerHTML = `
          <div class="init-screen">
            <div class="loading-text">Now Loading...</div>
          </div>
        `;

        this.controller = new InitGameScreenController(root, this.ctx);
        setTimeout(() => {
            this.emitInitFinished();
        }, 0);
    }

    private emitInitFinished() {
        const event: WorldEvent = { type: "INIT_GAME_SCREEN_FINISHED" };
        this.ctx.emitWorld(event);
    }

    show(): void {
        this.controller.show();
    }

    hide(): void {
        this.controller.hide();
    }

    update(): void { }

    handleUIAxes(axes: InputAxis[]): boolean {
        return true;
    }

    handleUIActions(actions: UIActionEvent[]): boolean {
        return true;
    }
}
