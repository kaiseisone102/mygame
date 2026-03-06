// src/renderer/router/useCase/gameUseCase/battle/EncounterUseCase.ts

import { TileData } from "../../../../../renderer/game/map/tiles/createTileDatabase";
import { WorldEvent } from "../../../../../renderer/router/WorldEvent";
import { GameState } from "../../../../../shared/data/gameState";
import { mapRules } from "../../../../../shared/type/mapRules";
import { TileType } from "../../../../../shared/type/tileType";
import { TileStepContext, ZoneContext } from "../../../../../shared/type/ZoneEvent";
import { ZonePx } from "../../../../../shared/type/ZonePx";
import { ZoneType } from "../../../../../shared/type/ZoneType";

export class EncounterUseCase {
    private encounterChance = 0; // 0.0 ～ 0.3

    constructor(
        private gameState: GameState,
        private tileDB: Record<TileType, TileData>,
        private emitWorld: (e: WorldEvent) => void
    ) { }

    onPlayerEnteredZone(event: { zone: ZonePx; ctx: ZoneContext }) {
        switch (event.zone.type) {
            case ZoneType.FIELD_ENEMY:
                this.emitWorld({ type: "ENCOUNTER_CONFIRMED", mapId: event.ctx.mapId });
                break;
        }
    }

    onStep(ctx: TileStepContext) {
        const rule = mapRules[ctx.mapId];
        if (!rule.encounterEnabled) {
            console.log("ここでは敵が出ないフラグ");
            return;
        }

        const tileData = this.tileDB[ctx.tileType];

        if (!tileData) {
            console.error("Unknown tileType:", ctx.tileType);
            return;
        }

        const tileModifier = tileData.encounterRateModifier ?? 1;

        // 最低確立を保証
        this.encounterChance = Math.max(rule.baseEncounterRate, this.encounterChance);
        // 確率を増やす
        this.encounterChance = Math.min(this.encounterChance + rule.stepIncrease * tileModifier, rule.maxChance);

        console.log("encounterChance",this.encounterChance);

        // 抽選
        if (Math.random() < this.encounterChance) {
            this.encounterChance = 0; // リセット
            this.gameState.battleReturn = { mapId: ctx.mapId, pos: ctx.pos };
            this.emitWorld({ type: "ENCOUNTER_CONFIRMED", mapId: ctx.mapId });
        }
    }

    reset() {
        this.encounterChance = 0;
    }
}
