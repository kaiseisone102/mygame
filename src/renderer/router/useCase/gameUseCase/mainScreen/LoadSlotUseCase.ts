// src/renderer/screens/router/useCase/LoadSlotsUseCase.ts

import { SaveManager } from "../../../../../renderer/save/saveManager";
import { SlotViewModel } from "../../../../../renderer/screens/viewModel/SlotViewModel";

export class LoadSlotsUseCase {
    private readonly SLOT_COUNT = 3;
    private slotSaves: SlotViewModel[] = [];

    constructor(private saveManager: SaveManager) { }

    /** 全スロットをロードしてキャッシュ */
    async execute(): Promise<SlotViewModel[]> {
        this.slotSaves = [];

        for (let i = 0; i < this.SLOT_COUNT; i++) {
            const slot = await this.saveManager.getSlotView(i + 1);
            this.slotSaves.push(slot);
        }
        return this.slotSaves;
    }

    /** キャッシュ参照用 */
    getSlots(): SlotViewModel[] {
        return this.slotSaves;
    }
}
