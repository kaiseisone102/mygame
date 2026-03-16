// src/renderer/save/SaveManager.ts

import { SaveData } from "../../shared/save/SaveData";
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
    private saveData!: SaveData;

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
        try {
            this.saveData = this.gameState.toSaveData();
            const jsonString = JSON.stringify(this.saveData);
            localStorage.setItem(`${slotId}`, jsonString);
            console.log("Game Saved!");
        } catch (e) {
            console.error("Failed to save to localStorage", e);
        }
        //this.saveRepo.saveGameFile(slotId, this.gameState.toSaveData());
    }

    /** スロットをロード */
    async load(slotId: number): Promise<boolean> {

        console.log("[GameState injected]", this.gameState, this.gameState instanceof GameState);

        try {
            const jsonString = localStorage.getItem(`${slotId}`);
            if (!jsonString) return false;

            this.saveData = JSON.parse(jsonString);
            console.log("Game Loaded!");

        } catch (e) {
            console.error("Failed to load from localStorage", e);
            return false;
        }
        //await this.saveRepo.loadGameFile(slotId);
        //if (!raw) return false;

        const data = migrateSaveData(this.saveData);
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
        const jsonString = localStorage.getItem(`${slotId}`);
        // await this.saveRepo.loadGameFile(slotId);
        if (!jsonString || jsonString.length === 0) {
            return {
                id: slotId,
                label: "空きスロット",
                isEmpty: true as const,
            };
        }

        try {
            // 3. データがある場合のみパースして migrate する
            const rawData = JSON.parse(jsonString);
            const data = migrateSaveData(rawData);

            return {
                id: slotId,
                label: `${data.playerName} Lv.${data.level}`,
                isEmpty: false as const,
                playerName: data.playerName,
                level: data.level,
            };
        } catch (e) {
            // パースに失敗（データが壊れているなど）した場合も空きとして扱う
            console.error(`Failed to parse slot ${slotId}`, e);
            return {
                id: slotId,
                label: "データ破損",
                isEmpty: true as const,
            };
        }
    }
}
