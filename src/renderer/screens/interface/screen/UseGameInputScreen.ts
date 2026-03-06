// src/renderer/screens/interface/screen/

import { GameActionEvent, InputAxis } from "@/renderer/input/mapping/InputMapper";

export interface UseGameInputScreen {
    handleGameActions(actions: GameActionEvent[]): boolean;
    handleGameAxes(axes: InputAxis[]): boolean;
}
