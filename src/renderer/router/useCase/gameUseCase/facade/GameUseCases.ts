// src/renderer/screens/router/useCase/facade/StartGameUseCase.ts

import { BgmUseCase } from "../audio/BgmUseCase";
import { AddBattleLogUseCase } from "../battle/AddBattleLogUseCase";
import { BattleCommandSelectedUseCase } from "../battle/BattleCommandSelectedUseCase";
import { BattleInputUseCase } from "../battle/BattleInputUseCase";
import { BattleResultUseCase } from "../battle/BattleResultUseCase";
import { BattleStartedUseCase } from "../battle/BattleStartedUseCase";
import { EncounterUseCase } from "../battle/EncounterUseCase";
import { InteractUseCase } from "../interact/InteractUseCase";
import { CollectItemUseCase } from "../interact/Item/CollectItemUseCase";
import { SelectSlotFlowUseCase } from "../mainScreen/SelectSlotFlowUseCase";
import { StartGameFlowUseCase } from "../mainScreen/StartGameFlowUseCase";
import { StartGameUseCase } from "../mainScreen/StartGameUseCase";
import { GoldHudUseCase } from "../overlay/GoldHudUseCase";
import { OpenOptionsUseCase } from "../overlay/OpenOptionsUseCase";
import { ShowFieldCommand } from "../overlay/ShowFieldCommand";
import { SaveConfigUseCase } from "../save/SaveConfigUseCase";
import { SaveGameUseCase } from "../save/SaveGameUseCase";
import { ChangeMainScreenUseCase } from "../screen/ChangeMainUseCase";
import { ChangeWorldUseCase } from "../world/ChangeWorldUseCase";
import { EnterForestTempleUseCase } from "../world/enterWorld/EnterForestTemple";
import { EnterWorldMapUseCase } from "../world/enterWorld/EnterWorldMapUseCase";
import { EnteredTownUseCase } from "../zone/EnteredTownUseCase";

type GameUseCasesDeps = {
    addBattleLogUseCase: AddBattleLogUseCase;
    battleCommandSelectedUseCase: BattleCommandSelectedUseCase;
    startGameFlowUseCase: StartGameFlowUseCase;
    changeMainScreenUseCase: ChangeMainScreenUseCase;
    selectSlotFlowUseCase: SelectSlotFlowUseCase;
    startGameUseCase: StartGameUseCase;
    openOptionsUseCase: OpenOptionsUseCase;
    bgmUseCase: BgmUseCase;
    enterForestTempleUseCase: EnterForestTempleUseCase;
    enterWorldMapUseCase: EnterWorldMapUseCase;
    changeWorldUseCase: ChangeWorldUseCase;
    enteredTownUseCase: EnteredTownUseCase;
    goldHudUseCase: GoldHudUseCase;
    showFieldCommand: ShowFieldCommand;
    saveGameUseCase: SaveGameUseCase;
    saveConfigUseCase: SaveConfigUseCase;
    encounterUseCase: EncounterUseCase;
    battleStartedUseCase: BattleStartedUseCase;
    battleResultUseCase: BattleResultUseCase;
    battleInputUseCase: BattleInputUseCase;
    interactUseCase: InteractUseCase;
    collectItemUseCase: CollectItemUseCase;
};

export class GameUseCases {

    public readonly startGameFlowUseCase!: StartGameFlowUseCase;

    // ChangeScreen
    public readonly changeMainScreenUseCase!: ChangeMainScreenUseCase;

    // スロットセレクト
    public readonly selectSlotFlowUseCase!: SelectSlotFlowUseCase;

    // ゲームスタート
    public readonly startGameUseCase!: StartGameUseCase;

    // Overlay
    public readonly openOptionsUseCase!: OpenOptionsUseCase;

    // Bgm
    public readonly bgmUseCase!: BgmUseCase;

    // 各マップ遷移 (専用フェードインなどに使う)
    public readonly enterForestTempleUseCase!: EnterForestTempleUseCase;
    public readonly enterWorldMapUseCase!: EnterWorldMapUseCase;

    // マップ遷移共通処理
    public readonly changeWorldUseCase!: ChangeWorldUseCase;
    public readonly enteredTownUseCase!: EnteredTownUseCase;

    // 所持金ハッド
    public readonly goldHudUseCase!: GoldHudUseCase;

    // フィールドアクション
    public readonly showFieldCommand!: ShowFieldCommand;

    // 保存
    public readonly saveGameUseCase!: SaveGameUseCase;
    public readonly saveConfigUseCase!: SaveConfigUseCase;

    // バトルworld
    public readonly encounterUseCase!: EncounterUseCase;
    public readonly battleStartedUseCase!: BattleStartedUseCase;
    public readonly battleResultUseCase!: BattleResultUseCase;

    //バトルUI
    public readonly battleInputUseCase!: BattleInputUseCase;
    public readonly battleCommandSelectedUseCase!: BattleCommandSelectedUseCase;
    public readonly addBattleLogUseCase!: AddBattleLogUseCase;

    // インタラクト処理
    public readonly interactUseCase!: InteractUseCase;
    public readonly collectItemUseCase!: CollectItemUseCase;

    constructor(deps: GameUseCasesDeps) {
        Object.assign(this, deps);
    }
}
