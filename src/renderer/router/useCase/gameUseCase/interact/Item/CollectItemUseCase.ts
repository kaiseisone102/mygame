// src/renderer/router/useCase/interact/item/collectItemUseCase.ts

import { ItemData } from "../../../../../../renderer/game/map/talkNPC/ItemData";
import { ScreenPort } from "../../../../../../renderer/port/ScreenPort";
import { GameState } from "../../../../../../shared/data/gameState";

export class CollectItemUseCase {

    constructor(private gameState: GameState, private screen: ScreenPort) { }
    execute(event: ItemData) {
        // 個数で管理
        this.gameState.collectItem(event.id, 1);
    }
}