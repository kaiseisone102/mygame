// src/renderer/game/map/factory/MapSystemFactory.ts

import { BuildingTemplateRepository } from "../repository/BuildingTemplateRepository";
import { ForestTempleBuilder } from "../builder/map/ForestTempleBuilder";
import { GraveCaveBuilder } from "../builder/map/GraveCaveBuilder";
import { NoFeatureTownBuilder } from "../builder/map/NoFeatureTownBuilder";
import { WorldMapBuilder } from "../builder/map/WorldMapBuilder";
import { MapRegistry } from "../registry/MapRegistry";
import { MapRepository } from "../repository/MapRepository";

export class MapSystemFactory {
    /**
     * マップ・建築に関連する一連のインスタンスを生成・集約して返します
     */
    static async create() {
        const mapRepository = new MapRepository();
        const buildingTemplateRepository = new BuildingTemplateRepository();
        
        // 共通で利用する建築データ（Square）を取得
        const buildingSquare = await buildingTemplateRepository.getBuildingSquare();

        // 各種ビルドロジックの集約
        const forestTempleBuilder = new ForestTempleBuilder(buildingSquare);
        const noFeatureTownBuilder = new NoFeatureTownBuilder(buildingSquare);
        const graveCaveBuilder = new GraveCaveBuilder(buildingSquare);
        const worldMapBuilder = new WorldMapBuilder(buildingSquare);

        const mapRegistry = new MapRegistry(
            forestTempleBuilder, 
            noFeatureTownBuilder, 
            graveCaveBuilder, 
            worldMapBuilder
        );

        return {
            mapRepository,
            mapRegistry,
            buildingSquare
        };
    }
}