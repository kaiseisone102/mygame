// src/renderer/app.ts

import "./screens/style/attackTargetOverlay.css";
import "./screens/style/battleLogOverlay.css";
import "./screens/style/battleBasicCommandOverlay.css";
import "./screens/style/global.css";
import "./screens/style/initGameScreen.css";
import "./screens/style/itemSelectOverLayInBattle.css";
import "./screens/style/magicTargetOverlay.css";
import "./screens/style/optionsOverlay.css";
import "./screens/style/slotSelect.css";
import "./screens/style/startMessage.css";
import "./screens/style/title.css";
import "./screens/style/viewport.css";
import "./screens/style/YesNoOverlay.css";
import "./screens/style/battleEnemyScreen.css";
import "./screens/style/InputNameOverlay.css";

import { GameState } from "../shared/data/gameState";
import { MainScreenType } from "../shared/type/screenType";
import { ZoneEventMap } from "../shared/type/ZoneEvent";
import { audioManager } from "./asset/audio/audioManager";
import { createPlayerAssets } from "./asset/createPlayerAssets";
import { ImageStore } from "./asset/ImageStore";
import { loadAssets } from "./asset/loadAssets";
import { BattleManager } from "./game/battle/core/BattleManager";
import { createInitialBattleState } from "./game/battle/core/BattleState";
import { SimpleAI } from "./game/battle/port/BattlePort";
import { BattlePortImpl } from "./game/battle/port/impl/BattlePortImpl";
import { TableMessageRepository } from "./game/map/infrastructure/message/TableMessageRepository";
import { InteractionService } from "./game/map/interaction/application/InteractionService";
import { InteractionResolver } from "./game/map/interaction/InteractionResolver";
import { createTileDatabase } from "./game/map/tiles/createTileDatabase";
import { TileRenderer } from "./game/map/tiles/tileRenderer";
import { WorldManager } from "./game/map/WorldManager";
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
import { MapRepository } from "./game/map/repository/MapRepository";
import { WorldDefinitionFactory } from "./game/map/factory/WorldDefinitionFactory";
import { BattleLogFormatter } from "./game/battle/event/BattleLogFormatter";
import { SkillRepository } from "../shared/master/battle/SkillRepository";
import { SkillPreset } from "../shared/master/battle/type/SkillPreset";

// import enemyMasterJson from "enemies/enemyMaster.json";
// import encounterTableJson from "./public/enemies/encounterTable.json";

console.log("window.saveGameAPI =", window.saveGameAPI);

if (!window.saveGameAPI) { throw new Error("saveGameAPI not found (preload not loaded)") };
if (!window.configAPI) { throw new Error("configAPI not found (preload not loaded)") };

await loadAssets();
// スキル生成
// NOTE:
// Electron(file://) 用のため、asset は HTML 相対パスで指定する
const skillsJson = await fetch("master/skills.json").then(r => r.json()) as Record<string, SkillPreset>;
const skillRepository = new SkillRepository(skillsJson);
console.log(skillsJson)

const playerAssets = createPlayerAssets(key => ImageStore.get(key));

const config = await window.configAPI.loadConfig();

audioManager.setMasterVolume(config.masterVolume);
audioManager.setBgmVolume(config.bgmVolume);
audioManager.setSeVolume(config.seVolume);

// const enemyMaster = enemyMasterJson as EnemyMasterJson;
// const encounterTable = encounterTableJson as EncounterTableJson;

// const enemyRepository = new EnemyRepository(enemyMaster);
// const encounterRepository = new EncounterRepository(encounterTable);

const worldDefinitionFactory = new WorldDefinitionFactory();
const mapRepository = new MapRepository();

// ワールドマップ (初期ワールド)
const worldManager = new WorldManager();

// tile system
const tileDB = createTileDatabase();
const tileRenderer = new TileRenderer(tileDB);
const tileEffectService = new TileEffectService(tileDB);

// ゲーム用情報()
const gameState = new GameState(0);
// バトルログ変換クラス
const battleLogFormatter = new BattleLogFormatter();
// 戦闘用情報の生成 （仮データ）
const initialBattleState = createInitialBattleState();
// BattleManager を生成
const battleManager = new BattleManager(battleLogFormatter, initialBattleState, skillRepository);

// screens
const overlayScreen = createOverlayScreens();
const interactionResolver = new InteractionResolver();
const messageRepo = new TableMessageRepository();
const interactionService = new InteractionService(messageRepo);
const mainScreens = createMainScreens(gameState, tileEffectService, worldManager, battleManager, overlayScreen);

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
// バトルシーンの初期化
const battleScene = mainScreens[MainScreenType.BATTLE_SCENE];
battleScene.setInitBattleState();

// UseCases(サービス層？)
const gameUseCases = createGameUseCases({
    mapRepository,
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
