// src/renderer/screens/mainScreens/screen/CaveScreen.ts

import { WorldDefinition } from "../../../game/map/builder/interface/definition/WorldDefinition";
import { WorldManager } from "../../../../renderer/game/map/WorldManager";
import { InputFrame } from "../../../../renderer/input/frame/InputFrame";
import { GameActionEvent, InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { TileEffectService } from "../../../service/tile/TileEffectService ";
import { GameState } from "../../../../shared/data/gameState";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { MainScreen } from "../../interface/screen/MainScreen";
import { UseGameInputScreen } from "../../interface/screen/UseGameInputScreen";
import { GraveCaveScreenController } from "./controller/GraveCaveScreenController";

export class GraveCaveScreen implements MainScreen, UseGameInputScreen {
    private controller!: GraveCaveScreenController;

    constructor(
        private gameState: GameState,
        private tileEffectService: TileEffectService,
        private worldManager: WorldManager,
    ) { }

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.controller = new GraveCaveScreenController(this.gameState, this.tileEffectService, this.worldManager);
        this.controller.init(root, initCtx);
        this.hide();
        console.log("[GraveCaveScreen] done init")
    }

    show() {
        this.controller.show();
    }

    hide() {
        this.controller.hide()
    }

    update(delta: number, frame: InputFrame) {
        this.controller.update(delta, frame);
    }

    handleGameAxes(axes: InputAxis[]): boolean {
        this.controller.gameAxes(axes);
        return true; // GAME操作は常に消費
    }

    handleGameActions(events: GameActionEvent[]): boolean {
        this.controller.gameActions(events);
        return false;
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        this.controller.UIActions(events);
        return false;
    }

    setWorld(def: WorldDefinition): void {
        console.log("[CaveScreen] setWorld called");
        this.controller.setWorld(def);
    }
}
