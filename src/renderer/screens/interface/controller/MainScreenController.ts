import { InputFrame } from "../../../../renderer/input/frame/InputFrame";
import { UIActionEvent, GameActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { BaseScreenController } from "./BaseScreenController";
import { WorldDefinition } from "../../../game/map/builder/interface/definition/WorldDefinition";
import { ZoneController } from "../../../../renderer/game/map/zone/ZoneController";

export interface MainScreenController extends BaseScreenController {
    UIActions(actions: UIActionEvent[]): void;
    GameAction?(events: GameActionEvent[]): void;
    update?(delta: number, frame: InputFrame): void;

    setWorld?(def: WorldDefinition, zoneController: ZoneController): void;
}