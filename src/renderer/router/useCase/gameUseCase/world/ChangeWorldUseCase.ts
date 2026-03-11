// src/renderer/router/useCase/world/ChangeWorldUseCase.ts

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
        // 1 JSONロード
        const mapJson = await this.mapRepository.load(mapId);

        // 2 新しいワールド定義作成
        const worldDef = this.factory.create(mapId, mapJson);

        // 3 WorldManager にセット（内部参照更新）
        this.worldManager.setWorld(worldDef);

        // 4 GameState にワールド更新
        this.gameState.setWorld(mapId);

        // 5 対応するスクリーン取得
        const screenType = mapIdToMainScreen[mapId];

        // Port経由でMainScreenにWorldを反映
        this.screenPort.setWorld(screenType, worldDef);
        // 累積エンカ率をリセット
        this.encounterUseCase.reset();

        // 6 画面切替
        this.changeMain.execute(screenType);
    }
}
