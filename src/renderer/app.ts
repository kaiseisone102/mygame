// src/renderer/app.ts

import "./screens/style/alliesStatusOverlay.css";
import "./screens/style/attackTargetOverlay.css";
import "./screens/style/battleBasicCommandOverlay.css";
import "./screens/style/battleEnemyScreen.css";
import "./screens/style/battleLogOverlay.css";
import "./screens/style/global.css";
import "./screens/style/initGameScreen.css";
import "./screens/style/InputNameOverlay.css";
import "./screens/style/itemSelectOverLayInBattle.css";
import "./screens/style/levelUpOverlay.css";
import "./screens/style/magicSelectOverlay.css";
import "./screens/style/optionsOverlay.css";
import "./screens/style/sandStormOverlay.css";
import "./screens/style/slotSelect.css";
import "./screens/style/MessageLog.css";
import "./screens/style/title.css";
import "./screens/style/YesNoOverlay.css";
import "./screens/style/FieldCommandOverlay.css";
import "./screens/style/ShopOverlay.css";
import "./screens/style/DamagePopupView.css";
import "./screens/style/Transition.css";
import "./screens/style/EncounterTransition.css";
import "./screens/style/BaseWorldScreenController.css";

import { NORM_SIZE } from "../shared/data/constants";
import { GameState } from "../shared/data/gameState";
import { MainScreenType } from "../shared/type/screenType";
import { ZoneEventMap } from "../shared/type/ZoneEvent";
import { createPlayerAssets } from "./asset/createPlayerAssets";
import { ImageStore } from "./asset/ImageStore";
import { loadAssets } from "./asset/loadAssets";
import { SystemInitializer } from "./bootstrap/SystemInitializer";
import { BattleManager } from "./game/battle/core/BattleManager";
import { BattlerFactory } from "./game/battle/enemy/factory/createEnemy";
import { BattleLogFormatter } from "./game/battle/event/BattleLogFormatter";
import { RewardCalculator } from "./game/battle/logic/rewards/RewardCalculator";
import { SimpleAI } from "./game/battle/port/BattlePort";
import { BattlePortImpl } from "./game/battle/port/impl/BattlePortImpl";
import { MapSystemFactory } from "./game/map/factory/MapSystemFactory";
import { WorldDefinitionFactory } from "./game/map/factory/WorldDefinitionFactory";
import { TableMessageRepository } from "./game/map/infrastructure/message/TableMessageRepository";
import { InteractionService } from "./game/map/interaction/application/InteractionService";
import { InteractionResolver } from "./game/map/interaction/InteractionResolver";
import { createTileDatabase } from "./game/map/tiles/createTileDatabase";
import { TileRenderer } from "./game/map/tiles/tileRenderer";
import { WorldManager } from "./game/map/WorldManager";
import { ZoneController } from "./game/map/zone/ZoneController";
import { MasterDataLoader } from "./infrastructure/MasterDataLoader";
import { EventBus } from "./router/EventBus";
import { BgmUseCase } from "./router/useCase/gameUseCase/audio/BgmUseCase";
import { createGameUseCases } from "./router/useCase/gameUseCase/facade/createGameUseCases";
import { registerZoneEventBridge } from "./router/ZoneEventBridge";
import { UIBootstrapper } from "./screens/factory/UIBootstrapper";
import { createMainScreens } from "./screens/mainScreen/createMainScreens";
import { createOverlayScreens } from "./screens/overlayScreen/createOverlayScreens";
import { TileEffectService } from "./service/tile/TileEffectService ";

// console.log("window.saveGameAPI =", window.saveGameAPI);

// if (!window.saveGameAPI) { throw new Error("saveGameAPI not found (preload not loaded)") };
// if (!window.configAPI) { throw new Error("configAPI not found (preload not loaded)") };

await loadAssets();
const masterData = await new MasterDataLoader().load();
const { mapRepository, mapRegistry } = await MapSystemFactory.create();

const messageRepo = new TableMessageRepository();

const interactionResolver = new InteractionResolver();
const interactionService = new InteractionService(messageRepo);

const playerAssets = createPlayerAssets(key => ImageStore.get(key));

const config = await window.configAPI.loadConfig();

const battlerFactory = new BattlerFactory();

const worldDefinitionFactory = new WorldDefinitionFactory(mapRegistry);

// ワールドマップ (初期ワールド)
const worldManager = new WorldManager();

// tile system
const tileDB = createTileDatabase();
const tileRenderer = new TileRenderer(tileDB);
const tileEffectService = new TileEffectService(tileDB);

// overlayScreen
const overlayScreen = createOverlayScreens(masterData.skillRepository);
// ゲーム用情報()
const gameState = new GameState(0);
// バトルログ変換クラス
const battleLogFormatter = new BattleLogFormatter();
// BattleManager を生成
const battleManager = new BattleManager(battleLogFormatter, masterData.skillRepository);

const zoneController = new ZoneController(NORM_SIZE);

const rewardCalculator = new RewardCalculator();

// MainScreen
const mainScreens = createMainScreens(gameState, masterData.allyGrowTable, tileEffectService, worldManager, battleManager, overlayScreen, rewardCalculator);

export const eventBus = new EventBus<ZoneEventMap>();

const root = document.getElementById("root")!;

const systems = SystemInitializer.init(gameState, worldManager, null, config);

const { screenManager, worldRouter, uiRouter, initCtx } = UIBootstrapper.setup({
    root,
    mainScreens,
    overlayScreen,
    gameState,
    inputSystem: systems.inputSystem,
    worldManager,
    worldQueryBus: systems.worldQueryBus,
    playerAssets,
    tileRenderer,
    config: config
});

const bgmUseCase = new BgmUseCase();

const simpleAI = new SimpleAI();
const battlePort = new BattlePortImpl(
    (e) => uiRouter.dispatch(e),
    simpleAI,
    battleManager
);
battleManager.setPort(battlePort);

// UseCases(サービス層？)
const gameUseCases = createGameUseCases({
    mapRepository,
    zoneController,
    worldDefinitionFactory,
    worldManager,
    gameState,
    saveManager: systems.saveManager,
    screens: screenManager,
    bgmUseCase,
    uiPort: uiRouter,
    saveQuery: systems.saveQuery,
    worldQuery: systems.worldQueryBus,
    battlePort: battlePort,
    tileDB: tileDB,
    skillRepository: masterData.skillRepository,
    enemyRepository: masterData.enemyRepository,
    encounterRepository: masterData.encounterRepository,
    battlerFactory,
    interactionResolver,
    interactionService,
    emitWorld: (event) => worldRouter.dispatch(event),
    emitUI: (event) => uiRouter.dispatch(event)
});

worldRouter.setUseCases(gameUseCases);
uiRouter.setUseCases(gameUseCases);

// スロットデータを preload 経由でロード
// await screenManager.loadAllSlots();
registerZoneEventBridge(initCtx.emitWorld);

// 起動シーケンス
async function startGame() {
    // 全画面の初期化
    await screenManager.initAllScreens();

    // TITLE_SCENE へ遷移 
    screenManager.changeMain(MainScreenType.TITLE_SCENE, undefined);

    // ゲームループ開始
    requestAnimationFrame(gameLoop);
}

// ループ
let last = 0;
function gameLoop(time: number) {
    const delta = time - last;
    last = time;

    const input = systems.inputSystem.pollFrame();
    screenManager.update(delta, input);



    requestAnimationFrame(gameLoop);
}

await startGame();
