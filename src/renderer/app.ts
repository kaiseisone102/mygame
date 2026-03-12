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
import "./screens/style/startMessage.css";
import "./screens/style/title.css";
import "./screens/style/viewport.css";
import "./screens/style/YesNoOverlay.css";

import { NORM_SIZE } from "../shared/data/constants";
import { GameState } from "../shared/data/gameState";
import { EnemyMasterJson } from "../shared/Json/enemy/EnemyTemplateJson";
import { GrowTableJson } from "../shared/Json/growTable/growTableJson";
import { SkillRepository } from "../shared/master/battle/SkillRepository";
import { SkillId, SkillPreset } from "../shared/master/battle/type/SkillPreset";
import { EncounterTableJson } from "../shared/type/battle/enemy/BiomeId";
import { MainScreenType } from "../shared/type/screenType";
import { ZoneEventMap } from "../shared/type/ZoneEvent";
import { audioManager } from "./asset/audio/audioManager";
import { createPlayerAssets } from "./asset/createPlayerAssets";
import { ImageStore } from "./asset/ImageStore";
import { loadAssets } from "./asset/loadAssets";
import { BattleManager } from "./game/battle/core/BattleManager";
import { BattlerFactory } from "./game/battle/enemy/factory/createEnemy";
import { EncounterRepository } from "./game/battle/enemy/repository/EncounterRepository";
import { EnemyRepository } from "./game/battle/enemy/repository/EnemyRepository";
import { BattleLogFormatter } from "./game/battle/event/BattleLogFormatter";
import { SimpleAI } from "./game/battle/port/BattlePort";
import { BattlePortImpl } from "./game/battle/port/impl/BattlePortImpl";
import { WorldDefinitionFactory } from "./game/map/factory/WorldDefinitionFactory";
import { TableMessageRepository } from "./game/map/infrastructure/message/TableMessageRepository";
import { InteractionService } from "./game/map/interaction/application/InteractionService";
import { InteractionResolver } from "./game/map/interaction/InteractionResolver";
import { MapRepository } from "./game/map/repository/MapRepository";
import { createTileDatabase } from "./game/map/tiles/createTileDatabase";
import { TileRenderer } from "./game/map/tiles/tileRenderer";
import { WorldManager } from "./game/map/WorldManager";
import { ZoneController } from "./game/map/zone/ZoneController";
import { InputSystem } from "./input/InputSystem";
import { AxisEventQueue } from "./input/keyboard/axis/AxisEventQueue";
import { InputManager } from "./input/keyboard/InputManager";
import { InputState } from "./input/state/InputState";
import { EventBus } from "./router/EventBus";
import { UIEventRouter } from "./router/UIEventRouter";
import { BgmUseCase } from "./router/useCase/gameUseCase/audio/BgmUseCase";
import { createGameUseCases } from "./router/useCase/gameUseCase/facade/createGameUseCases";
import { WorldEventRouter } from "./router/WorldEventRouter";
import { WorldQueryBus } from "./router/WorldQueryBus";
import { registerZoneEventBridge } from "./router/ZoneEventBridge";
import { SaveQueryService } from "./save/query/SaveQueryService";
import { ScreenQueryService } from "./save/query/ScreenQueryService";
import { SaveManager } from "./save/saveManager";
import { configRepository, saveGameRepository } from "./save/saveRepository";
import { ScreenInitContext } from "./screens/interface/context/ScreenInitContext";
import { createMainScreens } from "./screens/mainScreen/createMainScreens";
import { createOverlayScreens } from "./screens/overlayScreen/createOverlayScreens";
import { ScreenManager } from "./screens/ScreenManager";
import { TileEffectService } from "./service/tile/TileEffectService ";
import { BuildingTemplateRepository } from "./game/map/repository/BuildingTemplateRepository";
import { MapRegistry } from "./game/map/registry/MapRegistry";
import { ForestTempleBuilder } from "./game/map/builder/map/ForestTempleBuilder";
import { GraveCaveBuilder } from "./game/map/builder/map/GraveCaveBuilder";
import { NoFeatureTownBuilder } from "./game/map/builder/map/NoFeatureTownBuilder";
import { WorldMapBuilder } from "./game/map/builder/map/WorldMapBuilder";

console.log("window.saveGameAPI =", window.saveGameAPI);

if (!window.saveGameAPI) { throw new Error("saveGameAPI not found (preload not loaded)") };
if (!window.configAPI) { throw new Error("configAPI not found (preload not loaded)") };

await loadAssets();

// NOTE:
// Electron(file://) 用のため、asset は HTML 相対パスで指定する
const skillsJson = await fetch("master/skillMaster.json").then(r => r.json()) as Record<SkillId, SkillPreset>;
const skillRepository = new SkillRepository(skillsJson);

const enemyMaster = await fetch("master/enemies/enemyMaster.json").then(r => r.json()) as EnemyMasterJson;
const enemyRepository = new EnemyRepository(enemyMaster);

const encounterTable = await fetch("master/enemies/encounterTable.json").then(r => r.json()) as EncounterTableJson;
const encounterRepository = new EncounterRepository(encounterTable);

const allyGrowTable = await fetch("master/growTable.json").then(r => r.json()) as GrowTableJson;

const mapRepository = new MapRepository();

const messageRepo = new TableMessageRepository();

const buildingTemplateRepository = new BuildingTemplateRepository();
const buildingSquare = await buildingTemplateRepository.getBuildingSquare();


const interactionResolver = new InteractionResolver();
const interactionService = new InteractionService(messageRepo);

const playerAssets = createPlayerAssets(key => ImageStore.get(key));

const config = await window.configAPI.loadConfig();

audioManager.setMasterVolume(config.masterVolume);
audioManager.setBgmVolume(config.bgmVolume);
audioManager.setSeVolume(config.seVolume);

const battlerFactory = new BattlerFactory();

const forestTempleBuilder = new ForestTempleBuilder(buildingSquare);
const noFeatureTownBuilder = new NoFeatureTownBuilder(buildingSquare);
const graveCaveBuilder = new GraveCaveBuilder(buildingSquare);
const worldMapBuilder = new WorldMapBuilder(buildingSquare);
const mapRegistry = new MapRegistry(forestTempleBuilder, noFeatureTownBuilder, graveCaveBuilder, worldMapBuilder);

const worldDefinitionFactory = new WorldDefinitionFactory(mapRegistry);

// ワールドマップ (初期ワールド)
const worldManager = new WorldManager();

// tile system
const tileDB = createTileDatabase();
const tileRenderer = new TileRenderer(tileDB);
const tileEffectService = new TileEffectService(tileDB);

// overlayScreen
const overlayScreen = createOverlayScreens();
// ゲーム用情報()
const gameState = new GameState(0);
// バトルログ変換クラス
const battleLogFormatter = new BattleLogFormatter();
// BattleManager を生成
const battleManager = new BattleManager(battleLogFormatter, skillRepository, overlayScreen);

const zoneController = new ZoneController(NORM_SIZE);

// MainScreen
const mainScreens = createMainScreens(gameState, allyGrowTable, tileEffectService, worldManager, battleManager, overlayScreen);

const inputState = new InputState();

const axisQueue = new AxisEventQueue();

export const eventBus = new EventBus<ZoneEventMap>();

const inputManager = new InputManager(inputState, axisQueue);
const root = document.getElementById("root")!;
const inputSystem = new InputSystem(inputState, axisQueue, inputManager);

const saveManager = new SaveManager(saveGameRepository, configRepository, gameState);

const screenManager = new ScreenManager(
    root,
    mainScreens,
    overlayScreen,
    {} as ScreenInitContext, // 仮
    gameState,
    inputSystem,
);

const bgmUseCase = new BgmUseCase();
const uiRouter = new UIEventRouter(screenManager);
const screenQuery = new ScreenQueryService(screenManager, worldManager);
const saveQuery = new SaveQueryService(saveManager);
const worldQueryBus = new WorldQueryBus(worldManager, screenQuery, saveQuery, configRepository);

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
    saveManager,
    screens: screenManager,
    bgmUseCase,
    uiPort: uiRouter,
    saveQuery,
    worldQuery: worldQueryBus,
    battlePort: battlePort,
    tileDB: tileDB,
    skillRepository,
    enemyRepository,
    encounterRepository,
    battlerFactory,
    interactionResolver,
    interactionService,
    emitWorld: (event) => worldRouter.dispatch(event),
    emitUI: (event) => uiRouter.dispatch(event)
});
uiRouter.setUseCases(gameUseCases);
const worldRouter = new WorldEventRouter(screenManager, gameState, gameUseCases);

const initCtx: ScreenInitContext = {
    assets: { player: playerAssets },
    tileRenderer,
    gameState,
    getConfig: () => config,
    // 「Screen から Router への一方向ポート」
    emitWorld: (event) => worldRouter.dispatch(event),
    emitUI: (event) => uiRouter.dispatch(event),
    emitBattle: (event) => mainScreens[MainScreenType.BATTLE_ENEMY_SCREEN].handleUIEvent(event),
    querySync: (event) => worldQueryBus.dispatch(event),
    queryAsync: (event) => worldQueryBus.dispatchAsync(event),

    selectedSlotId: () => gameState.selectedSlotId,
    worldManager,
};

// スロットデータを preload 経由でロード
// await screenManager.loadAllSlots();
registerZoneEventBridge(initCtx.emitWorld);
// 初期化、タイトル画面表示
screenManager.setContext(initCtx);
await screenManager.initAllScreens();
screenManager.changeMain(MainScreenType.TITLE, undefined);

// ループ
let last = 0;
function gameLoop(time: number) {
    const delta = time - last;
    last = time;

    const input = inputSystem.pollFrame();
    screenManager.update(delta, input);

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
