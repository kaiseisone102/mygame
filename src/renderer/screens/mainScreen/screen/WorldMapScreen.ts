// src/renderer/screens/mainScreens/screen/worldMapScreen.ts

import { WorldDefinition } from "../../../game/map/builder/interface/definition/WorldDefinition";
import { WorldManager } from "../../../../renderer/game/map/WorldManager";
import { InputFrame } from "../../../../renderer/input/frame/InputFrame";
import { GameActionEvent, InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { TileEffectService } from "../../../service/tile/TileEffectService ";
import { GameState } from "../../../../shared/data/gameState";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { MainScreen } from "../../interface/screen/MainScreen";
import { UseGameInputScreen } from "../../interface/screen/UseGameInputScreen";
import { WorldMapScreenController } from "./controller/WorldMapScreenControler";
import { ZoneController } from "../../../../renderer/game/map/zone/ZoneController";
import { BaseWorldScreenController } from "../../../../renderer/screens/worldScene/BaseWorldScreenController";

export class WorldMapScreen implements MainScreen, UseGameInputScreen {
    private controller!: BaseWorldScreenController;

    constructor(
        private gameState: GameState,
        private tileEffectService: TileEffectService,
        private worldManager: WorldManager,
    ) { }

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.controller = new WorldMapScreenController(this.gameState, this.tileEffectService, this.worldManager);
        this.controller.init(root, initCtx);
        this.hide();
        console.log("[WorldMapScreen] done init")
    }

    show() {
        this.controller.show();
    }

    hide() {
        this.controller.hide();
    }

    update(delta: number, frame: InputFrame) {
        this.controller.update(delta, frame);
    }

    handleGameAxes(axes: InputAxis[]): boolean {
        this.controller.gameAxes(axes);
        return true;
    }

    handleGameActions(events: GameActionEvent[]): boolean {
        this.controller.gameActions(events);
        return true;
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        this.controller.UIActions(events);
        return true;
    }

    setWorld(def: WorldDefinition, zoneController: ZoneController): void {
        console.log("[WorldMapScreen] setWorld called");
        this.controller.setWorld(def, zoneController);
    }
}
