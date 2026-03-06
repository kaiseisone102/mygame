

import { NORM_SIZE } from "../../../shared/data/constants";
import { MapId } from "../../../shared/type/MapId";

export class RouterFunctions {
    /** preload 経由で全スロットロード */
    public async loadAllSlots() {
        for (let i = 0; i < this.slotSaves.length; i++) {
            this.slotSaves[i] = await window.saveGameAPI.loadGameFile(i + 1);
        }
    }

 

    private getSlotDisplay(slotId: number): string {
        const data = this.slotSaves[slotId - 1];
        if (!data) return "空きスロット";
        return `${data.playerName} Lv: ${data.Level}`;
    }

    public async confirmSlot(slotId: number, playerName?: string) {
        let data = this.slotSaves[slotId - 1];
        if (!data && playerName) {
            // 新規作成
            data = {
                playerName,
                Level: 1,
                hp: 100, mp: 30, exp: 0, gold: 0,
                pow: 5, int: 5, def: 5, spd: 5,
                luc: 5, avo: 0, crt: 0,
                mapId: MapId.FOREST_TEMPLE,
                where: {
                    forestTemple: { tx: 10 * NORM_SIZE, ty: 5 * NORM_SIZE }, // 初期位置
                    worldMap: { tx: 0, ty: 0 }, // ダミー
                }
            };
            this.slotSaves[slotId - 1] = data;
            await window.saveGameAPI.saveGameFile(slotId, data);
        }

        if (data) {
            // GameState に反映
            this.gameState.load(data);
        }
    }
}