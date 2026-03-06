// src/../../../../renderer/screens/router/useCase/facade/StartGameUseCase.ts

import { WorldManager } from "../../../../renderer/game/map/WorldManager";
import { ScreenPort } from "../../../../renderer/port/ScreenPort";
import { UIEventPort } from "../../../../renderer/port/UIEventPort";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../renderer/router/WorldEvent";
import { SaveQueryService } from "../../../../renderer/save/query/SaveQueryService";
import { SaveManager } from "../../../../renderer/save/saveManager";
import { GameState } from "../../../../shared/data/gameState";
import { WorldQueryPort } from "../../../../shared/port/WorldQueryPort";
import { BgmUseCase } from "../gameUseCase/audio/BgmUseCase";
import { BattleStartedUseCase } from "../gameUseCase/battle/BattleStartedUseCase";
import { CollectItemUseCase } from "../gameUseCase/interact/Item/CollectItemUseCase";
import { NpcInteractUseCase } from "../gameUseCase/interact/npc/NpcInteractUseCase";
import { ReadSignUseCase } from "../gameUseCase/interact/sign/ReadSignUseCase";
import { LoadSlotsUseCase } from "../gameUseCase/mainScreen/LoadSlotUseCase";
import { SelectSlotFlowUseCase } from "../gameUseCase/mainScreen/SelectSlotFlowUseCase";
import { StartGameFlowUseCase } from "../gameUseCase/mainScreen/StartGameFlowUseCase";
import { StartGameUseCase } from "../gameUseCase/mainScreen/StartGameUseCase";
import { OpenOptionsUseCase } from "../gameUseCase/overlay/OpenOptionsUseCase";
import { SaveConfigUseCase } from "../gameUseCase/save/SaveConfigUseCase";
import { SaveGameUseCase } from "../gameUseCase/save/SaveGameUseCase";
import { ChangeMainScreenUseCase } from "../gameUseCase/screen/ChangeMainUseCase";
import { ChangeWorldUseCase } from "../gameUseCase/world/ChangeWorldUseCase";
import { EnterForestTempleUseCase } from "../gameUseCase/world/enterWorld/EnterForestTemple";
import { EnterWorldMapUseCase } from "../gameUseCase/world/enterWorld/EnterWorldMapUseCase";

export class GameUseCases {
    startGameFlowUseCase: StartGameFlowUseCase;
    // ChangeScreen
    changeMainScreenUseCase: ChangeMainScreenUseCase;

    // スロットセレクト
    selectSlotFlowUseCase: SelectSlotFlowUseCase;

    // MainScreen
    loadSlotsUseCase: LoadSlotsUseCase;
    startGameUseCase: StartGameUseCase;

    // Overlay
    openOptionsUseCase: OpenOptionsUseCase;

    // Bgm
    bgmUseCase: BgmUseCase;

    // 各マップ遷移 (専用フェードインなどに使う)
    enterForestTempleUseCase: EnterForestTempleUseCase;
    enterWorldMapUseCase: EnterWorldMapUseCase;

    // マップ遷移共通処理
    changeWorldUseCase: ChangeWorldUseCase;

    // 保存
    saveGameUseCase: SaveGameUseCase;
    saveConfigUseCase: SaveConfigUseCase;

    // バトルworld
    battleStartedUseCase: BattleStartedUseCase;

    //バトルUI
    //battleUseCase: BattleUseCase;

    // インタラクト処理
    collectItemUseCase: CollectItemUseCase;
    npcInteractUseCase: NpcInteractUseCase;
    readSignUseCase: ReadSignUseCase;

    constructor(
        deps: {
            worldManager: WorldManager,
            gameState: GameState;
            saveManager: SaveManager;
            screens: ScreenPort;
            bgmUseCase: BgmUseCase;
            uiPort: UIEventPort;
            saveQuery: SaveQueryService;
            worldQuery: WorldQueryPort,
            emitWorld: (e: WorldEvent) => void;
            emitUI: (e: AppUIEvent) => void
        }) {

        // ChangeScreen
        this.changeMainScreenUseCase = new ChangeMainScreenUseCase(deps.screens, deps.bgmUseCase);

        this.selectSlotFlowUseCase = new SelectSlotFlowUseCase(deps.uiPort, deps.saveQuery);
        // MainScreen
        this.loadSlotsUseCase = new LoadSlotsUseCase(deps.saveManager);
        this.startGameUseCase = new StartGameUseCase(deps.saveManager, deps.screens);


        // Overlay
        this.openOptionsUseCase = new OpenOptionsUseCase();

        // Bgm
        this.bgmUseCase = deps.bgmUseCase;

        // マップ遷移共通処理
        this.enterForestTempleUseCase = new EnterForestTempleUseCase(this.changeMainScreenUseCase)
        this.enterWorldMapUseCase = new EnterWorldMapUseCase(this.changeMainScreenUseCase)

        // マップ遷移共通処理
        this.changeWorldUseCase = new ChangeWorldUseCase(deps.screens, deps.worldManager, deps.gameState, this.changeMainScreenUseCase);

        // 保存
        this.saveGameUseCase = new SaveGameUseCase(deps.saveManager);
        this.saveConfigUseCase = new SaveConfigUseCase();

        this.startGameFlowUseCase = new StartGameFlowUseCase(deps.screens, this.loadSlotsUseCase, this.bgmUseCase)

        // バトルWorld
        this.battleStartedUseCase = new BattleStartedUseCase(deps.emitWorld, deps.emitUI);

        // バトルUI
        //   battleStateはどこにもたせるべきか　ゲームステートなのか？
        //this.battleUseCase: new BattleUseCase(deps.gameState.battleState, deps.emitWorld, deps.emitUI);

        // インタラクト処理
        this.collectItemUseCase = new CollectItemUseCase(deps.gameState, deps.screens);
        this.npcInteractUseCase = new NpcInteractUseCase(deps.screens);
        this.readSignUseCase = new ReadSignUseCase(deps.screens);

    }
}
