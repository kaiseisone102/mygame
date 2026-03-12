// // src/renderer/screens/interface/screen/MainScreen.ts

import { GameActionEvent, InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { InputFrame } from "../../../../renderer/input/frame/InputFrame";
import { ScreenInitContext } from "../context/ScreenInitContext";
import { WorldDefinition } from "../../../game/map/builder/interface/definition/WorldDefinition";
import { ZoneController } from "../../../../renderer/game/map/zone/ZoneController";

export interface MainScreen<T = void> {
    init(root: HTMLElement, ctx: ScreenInitContext): void;
    show(payload: T): void;
    hide(): void;
    handleGameActions?(events: GameActionEvent[]): boolean;
    handleGameAxis?(axes: InputAxis[]): boolean;
    handleUIActions(actions: UIActionEvent[]): boolean;
    handleUIAxes(axes: InputAxis[]): boolean;
    update?(delta: number, frame: InputFrame): void;

    setWorld?(def: WorldDefinition, zoneController: ZoneController): void;

    // リソースの開放用 vueでいうunmount 今は使わないけど
    destroy?(): void;
}
