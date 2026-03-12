// src/renderer/router/useCase/world/ChangeWorldUseCase.ts

import { ZoneController } from "../../../../../renderer/game/map/zone/ZoneController";
import { WorldDefinitionFactory } from "../../../../../renderer/game/map/factory/WorldDefinitionFactory";
import { MapRepository } from "../../../../../renderer/game/map/repository/MapRepository";
import { WorldManager } from "../../../../../renderer/game/map/WorldManager";
import { ScreenPort } from "../../../../../renderer/port/ScreenPort";
import { GameState } from "../../../../../shared/data/gameState";
import { mapIdToMainScreen } from "../../../../../shared/events/world/mapIdToMainScreen";
import { MapId } from "../../../../../shared/type/MapId";
import { EncounterUseCase } from "../battle/EncounterUseCase";
import { ChangeMainScreenUseCase } from "../screen/ChangeMainUseCase";

export class ChangeWorldUseCase {
    constructor(
        private mapRepository: MapRepository,
        private zoneController: ZoneController,
        private factory: WorldDefinitionFactory,
        private screenPort: ScreenPort,
        private worldManager: WorldManager,
        private gameState: GameState,
        private changeMain: ChangeMainScreenUseCase,
        private encounterUseCase: EncounterUseCase
    ) { }

    /**
     * ワールド切り替えユースケース
     * - WorldManager の更新
     * - GameState の更新
     * - スクリーン内部の World / ObjectLayer / Zones 更新
     * - 画面切替
     */
    async execute(mapId: MapId) {

        const mapJson = await this.mapRepository.load(mapId);
        const worldDef = this.factory.create(mapId, mapJson);

        // preserve def while same map
        this.worldManager.setWorld(worldDef);
        this.gameState.setWorld(mapId);

        this.zoneController.clear();

        const screenType = mapIdToMainScreen[mapId];
        // pass def and zoneController for the screen 
        this.screenPort.setWorld(screenType, worldDef, this.zoneController);

        this.encounterUseCase.reset();
        // switch BGM and main screen
        this.changeMain.execute(screenType);
    }
}
