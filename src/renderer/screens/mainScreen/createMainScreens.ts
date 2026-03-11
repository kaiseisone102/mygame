// src/renderer/screens/mainScreens/createMainScreens.ts

import { BattleManager } from "../../../renderer/game/battle/core/BattleManager";
import { WorldManager } from "../../../renderer/game/map/WorldManager";
import { GameState } from "../../../shared/data/gameState";
import { GrowTableJson } from "../../../shared/Json/growTable/growTableJson";
import { MainScreenType } from "../../../shared/type/screenType";
import { TileEffectService } from "../../service/tile/TileEffectService ";
import { BattleScene } from "../battleScene/BattleScene";
import { BattleBackgroundScreen } from "../battleScene/mainScreen/BattleBackgroundScreen";
import { BattleEnemyScreen } from "../battleScene/mainScreen/BattleEnemyScreen";
import { GetOverlayScreenType } from "../interface/overlay/OverLayScreens";
import { ForestTempleScreen } from "./screen/ForestTempleScreen";
import { GraveCaveScreen } from "./screen/GraveCaveScreen";
import { InitGameScreen } from "./screen/InitGameScreen";
import { NoFeatureTownScreen } from "./screen/NoFeatureTownScreen";
import { SlotSelectScreen } from "./screen/SlotSelectScreen";
import { StartMessageScreen } from "./screen/StartMessageScreen";
import { TitleScreen } from "./screen/TitleScreen";
import { WorldMapScreen } from "./screen/WorldMapScreen";

export function createMainScreens(
    gameState: GameState,
    allyGrowTable: GrowTableJson,
    tileEffectService: TileEffectService,
    worldManager: WorldManager,
    battleManager: BattleManager,
    overlayScreen: GetOverlayScreenType,
) {
    const battleEnemyScreen = new BattleEnemyScreen();
    const battleBackGrounScreen = new BattleBackgroundScreen();
    return {
        [MainScreenType.INIT_GAME_SCREEN]: new InitGameScreen(),
        [MainScreenType.TITLE]: new TitleScreen(),
        [MainScreenType.SLOT_SELECT]: new SlotSelectScreen(),
        [MainScreenType.START_MESSAGE]: new StartMessageScreen(),
        [MainScreenType.FOREST_TEMPLE]: new ForestTempleScreen(gameState, tileEffectService, worldManager),
        [MainScreenType.WORLD_MAP]: new WorldMapScreen(gameState, tileEffectService, worldManager),
        [MainScreenType.NO_FEATURE_TOWN]: new NoFeatureTownScreen(gameState, tileEffectService, worldManager),
        [MainScreenType.GRAVE_CAVE]: new GraveCaveScreen(gameState, tileEffectService, worldManager),
        // 戦闘用シーン
        [MainScreenType.BATTLE_ENEMY_SCREEN]: battleEnemyScreen,
        [MainScreenType.BATTLE_BACKGROUND_SCREEN]: battleBackGrounScreen,
        [MainScreenType.BATTLE_SCENE]: new BattleScene(gameState, allyGrowTable, battleManager, battleEnemyScreen, battleBackGrounScreen, overlayScreen)
    } as const;
}