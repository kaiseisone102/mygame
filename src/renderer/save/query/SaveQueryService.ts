// src/renderer/save/query/SaveQueryService.ts

import { SaveManager } from "../../../renderer/save/saveManager";
import { SlotViewModel } from "../../screens/view/viewModel/SlotViewModel";

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
        // rawData は { id, label, isEmpty, playerName?, level? }
        const rawData = await this.saveManager.getSlotView(slotId);

        // UI 側で計算したり整形したりする必要があるならここで行う
        // 例: 「Lv」の表記揺れを防ぐ、未入力の名前を「ななし」にする等
        return {
            ...rawData,
            label: rawData.isEmpty ? "---- 空きスロット ----" : `${rawData.playerName} (Lv.${rawData.level})`,
        };
    }
}
