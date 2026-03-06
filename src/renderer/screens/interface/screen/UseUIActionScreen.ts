// src/renderer/screens/interface/screen/

import { UIActionEvent } from "@/renderer/input/mapping/InputMapper";

export interface UseUIActionScreen {
    handleUIActions(actions: UIActionEvent[]): boolean;
}
