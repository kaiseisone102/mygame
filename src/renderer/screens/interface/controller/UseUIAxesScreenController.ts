import { InputAxis } from "@/renderer/input/mapping/InputMapper";

export interface UseUIAxesScreenController {
    UIAxes(axes: InputAxis[]): void;
}