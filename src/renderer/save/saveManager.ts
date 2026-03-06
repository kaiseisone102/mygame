// src/renderer/save/SaveManager.ts

import { GameState } from "../../shared/data/gameState";
import { migrateSaveData } from "../../shared/save/migrateSaveData";
import { ConfigRepository, SaveGameRepository } from "./saveRepository";

/**
 * SaveManager
 * -----------
 * セーブデータに関する中核ロジック
 * - スロット状態を保持
 * - ロード／作成／確定を行う
 * - GameState を初期化する
 */
export class SaveManager {
    public currentSlotId: number = 0;

    constructor(
        private saveRepo: SaveGameRepository,
        private configRepo: ConfigRepository,
        private gameState: GameState
    ) { }

    /** 現在スロットを保存 */
    async saveCurrent(): Promise<void> {

        console.log("[GameState injected]", this.gameState, this.gameState instanceof GameState);

        const slotId = this.gameState.selectedSlotId;
        if (slotId == null) {
            console.warn("[SaveManager] No slot selected");
            return;
        }
        await this.saveRepo.saveGameFile(slotId, this.gameState.toSaveData());
    }

    /** スロットをロード */
    async load(slotId: number): Promise<boolean> {

        console.log("[GameState injected]", this.gameState, this.gameState instanceof GameState);

        const raw = await this.saveRepo.loadGameFile(slotId);
        if (!raw) return false;

        const data = migrateSaveData(raw);
        this.gameState.reset();
        this.gameState.selectSlot(slotId);
        this.gameState.load(data);
        return true;
    }

    /** 新規スロット作成 */
    async createNew(slotId: number, playerName: string): Promise<void> {

        console.log("[GameState injected]", this.gameState, this.gameState instanceof GameState);

        this.gameState.reset();
        this.gameState.setPlayerName(playerName);
        this.gameState.selectSlot(slotId);
        await this.saveCurrent();
    }


    /** UI用：スロット表示 */
    async getSlotView(slotId: number) {
        const raw = await this.saveRepo.loadGameFile(slotId);
        if (!raw) {
            return {
                id: slotId,
                label: "空きスロット",
                isEmpty: true as const,
            };
        }

        const data = migrateSaveData(raw);
        return {
            id: slotId,
            label: `${data.playerName} Lv.${data.level}`,
            isEmpty: false as const,
            playerName: data.playerName,
            level: data.level,
        };
    }
}
