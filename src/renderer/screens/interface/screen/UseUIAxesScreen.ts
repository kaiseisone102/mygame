// src/renderer/screens/interface/screen/

import { InputAxis } from "@/renderer/input/mapping/InputMapper";

export interface UseUIAxesScreen {
    handleUIAxes(axes: InputAxis[]): boolean;
}