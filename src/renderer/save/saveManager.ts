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

    /** 現在スロットをファイルへ保存 */
    async saveCurrent(): Promise<void> {

        const slotId = this.gameState.selectedSlotId;
        if (slotId == null) {
            console.warn("[SaveManager] No slot selected");
            return;
        }
        try {
            // GameState から純粋なデータを取り出す
            const data: SaveData = this.gameState.toSaveData();

            // Repository (Electron IPC) 経由でファイル保存
            await this.saveRepo.saveGameFile(slotId, data);

            console.log(`[SaveManager] Slot ${slotId} saved successfully.`);
        } catch (e) {
            console.error("[SaveManager] Failed to save game file", e);
        }
    }

    /** ファイルからスロットをロード */
    async load(slotId: number): Promise<boolean> {

        try {
            // Repository 経由でファイルを読み込む
            const rawData = await this.saveRepo.loadGameFile(slotId);
            if (!rawData) {
                console.log(`[SaveManager] Slot ${slotId} is empty.`);
                return false;
            }

            // 2. データのマイグレーション（古いバージョンとの互換性確保）
            const data = migrateSaveData(rawData);

            // 3. GameState への反映
            this.gameState.reset();
            this.gameState.selectSlot(slotId);
            this.gameState.load(data);

            console.log(`[SaveManager] Slot ${slotId} loaded successfully.`);
            return true;
        } catch (e) {
            console.error(`[SaveManager] Failed to load slot ${slotId}`, e);
            return false;
        }
    }

    /** 新規スロット作成 */
    async createNew(slotId: number, playerName: string): Promise<void> {
        this.gameState.reset();
        this.gameState.setPlayerName(playerName);
        this.gameState.selectSlot(slotId);
        console.log("selectedSlotId: ", this.gameState.selectedSlotId)
        // 初期状態をファイルに書き込む
        await this.saveCurrent();
    }


    /** UI用：スロットのプレビュー表示情報を取得 */
    async getSlotView(slotId: number) {
        try {
            // ファイルを読み込んでみる
            const rawData = await this.saveRepo.loadGameFile(slotId);

            if (!rawData) {
                return {
                    id: slotId,
                    label: "空きスロット",
                    isEmpty: true as const,
                };
            }

            const data = migrateSaveData(rawData);

            return {
                id: slotId,
                label: `${data.playerName} Lv.${data.level}`,
                isEmpty: false as const,
                playerName: data.playerName,
                level: data.level,
            };
        } catch (e) {
            console.error(`[SaveManager] Failed to get slot view for ${slotId}`, e);
            return {
                id: slotId,
                label: "データ破損",
                isEmpty: true as const,
            };
        }
    }
}