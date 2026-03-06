// src/renderer/router/useCase/interact/item/collectItemUseCase.ts

import { ScreenPort } from "../../../../../../renderer/port/ScreenPort";
import { GameState } from "../../../../../../shared/data/gameState";
import { OverlayScreenType } from "../../../../../../shared/type/screenType";

export class CollectItemUseCase {

    constructor(private gameState: GameState, private screen: ScreenPort) { }
    execute(event: any) {
        // 表示（UI責務）
        this.screen.pushOverlay(OverlayScreenType.MESSAGE_LOG, { messages: [`「${event.item.type}」を手に入れた！`] });
        // 個数で管理
        this.gameState.collectItem(event.item.id, 1);

    }
}