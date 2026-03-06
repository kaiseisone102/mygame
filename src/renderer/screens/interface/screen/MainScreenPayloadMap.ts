// src/renderer/screens/interface/screen/MainScreenPayloadMap.ts

import { MainScreenType } from "../../../../shared/type/screenType"
import { MainScreen } from "./MainScreen";
import { BattleScenePayload } from "../../../../renderer/screens/battleScene/battleScene";

export type MainScreenPayloadMap = {
    [MainScreenType.INIT_GAME_SCREEN]: undefined;
    [MainScreenType.TITLE]: undefined;
    [MainScreenType.SLOT_SELECT]: undefined;
    [MainScreenType.START_MESSAGE]: undefined;
    [MainScreenType.FOREST_TEMPLE]: undefined;
    [MainScreenType.WORLD_MAP]: undefined;
    [MainScreenType.NO_FEATURE_TOWN]: undefined;
    [MainScreenType.GRAVE_CAVE]: undefined;
    // 戦闘用シーン
    [MainScreenType.BATTLE_ENEMY_SCREEN]: undefined;
    [MainScreenType.BATTLE_BACKGROUND_SCREEN]: undefined;
    [MainScreenType.BATTLE_SCENE]: BattleScenePayload;
};

export type MainScreenInstanceMap = {
    [K in keyof MainScreenPayloadMap]: MainScreen<MainScreenPayloadMap[K]>
};