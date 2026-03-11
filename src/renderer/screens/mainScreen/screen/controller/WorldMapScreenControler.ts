// src/renderer/screens/mainScreens/screen/controller/WorldMapScreenController.ts

import { BaseWorldScreenController } from "../../../../../renderer/screens/worldScene/BaseWorldScreenController";
import { MainScreenType } from "../../../../../shared/type/screenType";

export class WorldMapScreenController extends BaseWorldScreenController {
    protected screenId: string = MainScreenType.WORLD_MAP;
}

