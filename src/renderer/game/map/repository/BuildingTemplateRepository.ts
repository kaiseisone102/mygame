// src/renderer/game/map/repository/BuildingTemplateRepository.ts

import { BuildingSquare } from "../tiles/placeBuildingSquare";

export class BuildingTemplateRepository {

    async getBuildingSquare(): Promise<BuildingSquare> {
        return await fetch("maps/template/building/building_square.json")
            .then(r => r.json()) as BuildingSquare;
    }

}