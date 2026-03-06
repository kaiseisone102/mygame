// src/renderer/screens/type/ScreenInitContext.ts

import { AssetsContext } from "../../../../renderer/asset/AssetsContext";
import { TileRenderer } from "../../../../renderer/game/map/tiles/tileRenderer";
import { WorldManager } from "../../../../renderer/game/map/WorldManager";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { GameConfig } from "../../../../shared/config/GameConfig";
import { GameState } from "../../../../shared/data/gameState";
import { WorldEvent } from "../../../../renderer/router/WorldEvent";
import { SlotViewModel } from "../../../../renderer/screens/viewModel/SlotViewModel";
import { WorldQueryAsyncEvent, WorldQuerySyncEvent } from "../../../../shared/events/world/WorldQuerryEvent";

export interface ScreenInitContext {
    // 表示・描画
    assets: AssetsContext;
    tileRenderer: TileRenderer;

    // 参照専用
    gameState: Readonly<GameState>;
    getConfig: () => Readonly<GameConfig>;

    // イベント通知
    emitWorld(event: WorldEvent): void;
    emitUI(event: AppUIEvent): void;
    emitBattle(event: AppUIEvent): void;

    // 同期クエリのみ
    querySync(event: WorldQuerySyncEvent): number | string | null;

    queryAsync(event: WorldQueryAsyncEvent): Promise<SlotViewModel | GameConfig>;

    selectedSlotId: () => number | null;

    worldManager: WorldManager,
}