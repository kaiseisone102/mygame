// src/renderer/screens/router/useCase/facade/createGameUseCases.ts

import { BattlerFactory } from "../../../../../renderer/game/battle/enemy/factory/createEnemy";
import { EncounterRepository } from "../../../../../renderer/game/battle/enemy/repository/EncounterRepository";
import { EnemyRepository } from "../../../../../renderer/game/battle/enemy/repository/EnemyRepository";
import { BattlePort } from "../../../../../renderer/game/battle/port/BattlePort";
import { WorldDefinitionFactory } from "../../../../../renderer/game/map/factory/WorldDefinitionFactory";
import { InteractionService } from "../../../../../renderer/game/map/interaction/application/InteractionService";
import { InteractionResolver } from "../../../../../renderer/game/map/interaction/InteractionResolver";
import { MapRepository } from "../../../../../renderer/game/map/repository/MapRepository";
import { TileData } from "../../../../../renderer/game/map/tiles/createTileDatabase";
import { WorldManager } from "../../../../../renderer/game/map/WorldManager";
import { ZoneController } from "../../../../../renderer/game/map/zone/ZoneController";
import { ScreenPort } from "../../../../../renderer/port/ScreenPort";
import { UIEventPort } from "../../../../../renderer/port/UIEventPort";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../../renderer/router/WorldEvent";
import { SaveQueryService } from "../../../../../renderer/save/query/SaveQueryService";
import { SaveManager } from "../../../../../renderer/save/saveManager";
import { GameState } from "../../../../../shared/data/gameState";
import { SkillRepository } from "../../../../../shared/master/battle/SkillRepository";
import { WorldQueryPort } from "../../../../../shared/port/WorldQueryPort";
import { TileType } from "../../../../../shared/type/tileType";
import { BgmUseCase } from "../audio/BgmUseCase";
import { AddBattleLogUseCase } from "../battle/AddBattleLogUseCase";
import { BattleCommandSelectedUseCase } from "../battle/BattleCommandSelectedUseCase";
import { BattleInputUseCase } from "../battle/BattleInputUseCase";
import { BattleResultUseCase } from "../battle/BattleResultUseCase";
import { BattleStartedUseCase } from "../battle/BattleStartedUseCase";
import { EncounterUseCase } from "../battle/EncounterUseCase";
import { InteractUseCase } from "../interact/InteractUseCase";
import { CollectItemUseCase } from "../interact/Item/CollectItemUseCase";
import { NpcInteractUseCase } from "../interact/npc/NpcInteractUseCase";
import { ReadSignUseCase } from "../interact/sign/ReadSignUseCase";
import { SelectSlotFlowUseCase } from "../mainScreen/SelectSlotFlowUseCase";
import { StartGameFlowUseCase } from "../mainScreen/StartGameFlowUseCase";
import { StartGameUseCase } from "../mainScreen/StartGameUseCase";
import { OpenOptionsUseCase } from "../overlay/OpenOptionsUseCase";
import { SaveConfigUseCase } from "../save/SaveConfigUseCase";
import { SaveGameUseCase } from "../save/SaveGameUseCase";
import { ChangeMainScreenUseCase } from "../screen/ChangeMainUseCase";
import { ChangeWorldUseCase } from "../world/ChangeWorldUseCase";
import { EnterForestTempleUseCase } from "../world/enterWorld/EnterForestTemple";
import { EnterWorldMapUseCase } from "../world/enterWorld/EnterWorldMapUseCase";
import { EnteredTownUseCase } from "../zone/EnteredTownUseCase";
import { GameUseCases } from "./GameUseCases";

export function createGameUseCases(deps: {
    mapRepository: MapRepository,
    zoneController: ZoneController,
    worldManager: WorldManager,
    worldDefinitionFactory: WorldDefinitionFactory,
    gameState: GameState,
    saveManager: SaveManager,
    screens: ScreenPort,
    bgmUseCase: BgmUseCase,
    uiPort: UIEventPort,
    saveQuery: SaveQueryService,
    worldQuery: WorldQueryPort,
    battlePort: BattlePort,
    tileDB: Record<TileType, TileData>,
    skillRepository: SkillRepository,
    enemyRepository: EnemyRepository,
    encounterRepository: EncounterRepository,
    battlerFactory: BattlerFactory,
    interactionResolver: InteractionResolver,
    interactionService: InteractionService,
    emitWorld: (e: WorldEvent) => void,
    emitUI: (e: AppUIEvent) => void
}): GameUseCases {

    // バトルWorld
    const encounterUseCase = new EncounterUseCase(deps.gameState, deps.tileDB, deps.emitWorld);
    const battleStartedUseCase = new BattleStartedUseCase(deps.enemyRepository, deps.encounterRepository, deps.battlerFactory, deps.emitWorld, deps.emitUI);
    const battleCommandSelectedUseCase = new BattleCommandSelectedUseCase(deps.emitUI);
    const battleResultUseCase = new BattleResultUseCase(deps.emitWorld);

    // ChangeScreen
    const changeMainScreenUseCase = new ChangeMainScreenUseCase(deps.screens, deps.bgmUseCase);

    const selectSlotFlowUseCase = new SelectSlotFlowUseCase(deps.uiPort, deps.saveQuery);

    // マップ遷移共通処理
    const changeWorldUseCase = new ChangeWorldUseCase(deps.mapRepository, deps.zoneController, deps.worldDefinitionFactory, deps.screens, deps.worldManager, deps.gameState, changeMainScreenUseCase, encounterUseCase);

    // ゲームスタート
    const startGameUseCase = new StartGameUseCase(deps.saveManager, changeWorldUseCase);

    // Overlay
    const openOptionsUseCase = new OpenOptionsUseCase();

    // Bgm
    const bgmUseCase = deps.bgmUseCase;

    // マップ遷移共通処理
    const enterForestTempleUseCase = new EnterForestTempleUseCase(changeMainScreenUseCase)
    const enterWorldMapUseCase = new EnterWorldMapUseCase(changeMainScreenUseCase)
    const enteredTownUseCase = new EnteredTownUseCase(changeWorldUseCase);

    // 保存
    const saveGameUseCase = new SaveGameUseCase(deps.saveManager);
    const saveConfigUseCase = new SaveConfigUseCase();

    const startGameFlowUseCase = new StartGameFlowUseCase(deps.screens, bgmUseCase)

    // バトルUI
    const battleInputUseCase = new BattleInputUseCase(deps.battlePort, deps.emitUI);
    const addBattleLogUseCase = new AddBattleLogUseCase(deps.screens);

    // インタラクト処理
    const interactUseCase = new InteractUseCase(deps.emitWorld, deps.emitUI, deps.interactionResolver, deps.interactionService);
    const collectItemUseCase = new CollectItemUseCase(deps.gameState, deps.screens);
    const npcInteractUseCase = new NpcInteractUseCase(deps.screens);
    const readSignUseCase = new ReadSignUseCase(deps.screens);

    return new GameUseCases({
        addBattleLogUseCase,
        battleCommandSelectedUseCase,
        startGameFlowUseCase,
        selectSlotFlowUseCase,
        changeMainScreenUseCase,
        changeWorldUseCase,
        startGameUseCase,
        openOptionsUseCase,
        bgmUseCase: deps.bgmUseCase,
        enterForestTempleUseCase,
        enterWorldMapUseCase,
        enteredTownUseCase,
        saveGameUseCase,
        saveConfigUseCase,
        encounterUseCase,
        battleStartedUseCase,
        battleResultUseCase,
        battleInputUseCase,
        interactUseCase,
        collectItemUseCase,
        npcInteractUseCase,
        readSignUseCase,
    });
}
