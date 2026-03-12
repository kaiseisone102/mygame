// src/renderer/screens/router/useCase/facade/StartGameUseCase.ts

import { OpenOptionsUseCase } from "../overlay/OpenOptionsUseCase";
import { BgmUseCase } from "../audio/BgmUseCase";
import { EnterForestTempleUseCase } from "../world/enterWorld/EnterForestTemple";
import { EnterWorldMapUseCase } from "../world/enterWorld/EnterWorldMapUseCase";
import { ChangeWorldUseCase } from "../world/ChangeWorldUseCase";
import { SaveConfigUseCase } from "../save/SaveConfigUseCase";
import { StartGameUseCase } from "../mainScreen/StartGameUseCase";
import { StartGameFlowUseCase } from "../mainScreen/StartGameFlowUseCase";
import { SelectSlotFlowUseCase } from "../mainScreen/SelectSlotFlowUseCase";
import { SaveGameUseCase } from "../save/SaveGameUseCase";
import { BattleStartedUseCase } from "../battle/BattleStartedUseCase";
import { ChangeMainScreenUseCase } from "../screen/ChangeMainUseCase";
import { CollectItemUseCase } from "../interact/Item/CollectItemUseCase";
import { ReadSignUseCase } from "../interact/sign/ReadSignUseCase";
import { NpcInteractUseCase } from "../interact/npc/NpcInteractUseCase";
import { EncounterUseCase } from "../battle/EncounterUseCase";
import { BattleInputUseCase } from "../battle/BattleInputUseCase";
import { BattleResultUseCase } from "../battle/BattleResultUseCase";
import { InteractUseCase } from "../interact/InteractUseCase";
import { EnteredTownUseCase } from "../zone/EnteredTownUseCase";
import { AddBattleLogUseCase } from "../battle/AddBattleLogUseCase";
import { BattleCommandSelectedUseCase } from "../battle/BattleCommandSelectedUseCase";

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
    saveGameUseCase: SaveGameUseCase;
    saveConfigUseCase: SaveConfigUseCase;
    encounterUseCase: EncounterUseCase;
    battleStartedUseCase: BattleStartedUseCase;
    battleResultUseCase: BattleResultUseCase;
    battleInputUseCase: BattleInputUseCase;
    interactUseCase: InteractUseCase;
    collectItemUseCase: CollectItemUseCase;
    npcInteractUseCase: NpcInteractUseCase;
    readSignUseCase: ReadSignUseCase;
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
    public readonly npcInteractUseCase!: NpcInteractUseCase;
    public readonly readSignUseCase!: ReadSignUseCase;

    constructor(deps: GameUseCasesDeps) {
        Object.assign(this, deps);
    }
}
