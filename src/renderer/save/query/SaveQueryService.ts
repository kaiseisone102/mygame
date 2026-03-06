// src/renderer/save/query/SaveQueryService.ts

import { SaveManager } from "../../../renderer/save/saveManager";
import { SlotViewModel } from "../../screens/viewModel/SlotViewModel";

/**
 * SaveQueryService
 * ----------------
 * UI から参照される「読み取り専用」サービス
 * - 状態は変更しない
 * - 非同期処理を持たない
 * - ViewModel に変換して返す
 */
export class SaveQueryService {
    constructor(private saveManager: SaveManager) { }

    /** 現在選択中のスロットIDを取得（参照のみ） */
    getCurrentSlotId(): number {
        return this.saveManager.currentSlotId;
    }

    /** UI 表示用のスロット情報を取得 */
    async getSlotView(slotId: number): Promise<SlotViewModel> {
        const data = await this.saveManager.getSlotView(slotId);
        if (data.isEmpty) {
            return {
                id: slotId,
                label: "空きスロット",
                isEmpty: true,
            };
        }
        return {
            id: slotId,
            label: `${data.playerName} Lv:${data.level}`,
            isEmpty: false,
            level: data.level,
            playerName: data.playerName,
        };
    }
}
