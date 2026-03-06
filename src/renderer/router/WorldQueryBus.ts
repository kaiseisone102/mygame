// src/renderer/screens/router/WorldQueryBus.ts

import { GameConfig } from "../../shared/config/GameConfig";
import { WorldQueryAsyncEvent, WorldQuerySyncEvent } from "../../shared/events/world/WorldQuerryEvent";
import { TileQueryPort } from "../../shared/port/TileQueryPort";
import { SaveQueryService } from "../save/query/SaveQueryService";
import { ScreenQueryService } from "../save/query/ScreenQueryService";
import { ConfigRepository } from "../save/saveRepository";
import { SlotViewModel } from "../screens/viewModel/SlotViewModel";

export class WorldQueryBus implements TileQueryPort {
    constructor(
        private tileQuery: TileQueryPort,
        private screenQuery: ScreenQueryService,
        private saveQuery: SaveQueryService,
        private configRepo: ConfigRepository
    ) { }

    // getPlayerStatus() {
    //     return this.saveQuery.getPlayerStatus();
    // }

    // getEnemyList() {
    //     return this.screenQuery.getVisibleEnemies();
    // }

    getTileType(tx: number, ty: number) {
        return this.tileQuery.getTileType(tx, ty);
    }

    // ===== Sync =====
    dispatch(event: WorldQuerySyncEvent) {
        switch (event.type) {
            case "GET_CURRENT_SLOT_ID":
                return this.saveQuery.getCurrentSlotId();
            case "GET_ACTIVE_OVERLAY_TYPE":
                return this.screenQuery.getActiveOverlayType();
        }
    }

    // ===== Async =====
    dispatchAsync(event: WorldQueryAsyncEvent): Promise<SlotViewModel | GameConfig> {
        switch (event.type) {
            case "GET_SLOT_VIEW":
                return this.saveQuery.getSlotView(event.slotId);
            case "GET_CONFIG":
                return this.configRepo.loadConfig();
        }
    }
}
