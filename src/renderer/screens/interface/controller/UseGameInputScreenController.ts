import { GameActionEvent, InputAxis } from "@/renderer/input/mapping/InputMapper";

export interface UseGameInputScreenController {
    gameActions(actions: GameActionEvent[]): void;
    gameAxes(axes: InputAxis[]): void;
}
