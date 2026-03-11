// src/renderer/screens/mainScreens/screen/controller/TownScreenController.ts

import { BaseWorldScreenController } from "../../../../../renderer/screens/worldScene/BaseWorldScreenController";
import { MainScreenType } from "../../../../../shared/type/screenType";

export class NoFeatureTownScreenController extends BaseWorldScreenController {
    protected screenId: string = MainScreenType.NO_FEATURE_TOWN;
}
