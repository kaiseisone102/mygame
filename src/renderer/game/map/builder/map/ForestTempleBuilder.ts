// src/renderer/game/map/builder/ForestTempleBuilder.ts

import { World } from "../../../../../shared/core/world";
import { MapCategory, WORLD_DEFAULT_TILE } from "../../../../../shared/type/mapRules";
import { TileType } from "../../../../../shared/type/tileType";
import { addObject, addObjectBlock } from "../../objects/addObjectBlock";
import { ObjectLayer } from "../../objects/objectLayer";
import { ObjectType } from "../../objects/objectType";
import { fillRectTile } from "../../tiles/fillRectTile";
import { BuildingSquare, BuildingSquareId, placeBuildingSquare } from "../../tiles/placeBuildingSquare";
import { BaseWorldDefinition } from "../interface/definition/WorldDefinition";
import { MapBuilder } from "../interface/MapBuilder";

export class ForestTempleBuilder implements MapBuilder {

    constructor(private buildingSquare: BuildingSquare) { };

    build(): BaseWorldDefinition {

        const world = new World(30, 35, WORLD_DEFAULT_TILE[MapCategory.TOWN]);
        const objectLayer = new ObjectLayer();

        world.ensureChunk(0, 0);

        fillRectTile(world, 0, 29, 0, 34, TileType.PLAIN);
        fillRectTile(world, 11, 18, 18, 34, TileType.DIRT);
       
        addObjectBlock(objectLayer, ObjectType.TREE, 0, 0, 1, 11);
        addObjectBlock(objectLayer, ObjectType.TREE, 27, 0, 1, 11);
        addObjectBlock(objectLayer, ObjectType.TREE, 3, 0, 9, 1);

        addObject(objectLayer, ObjectType.TREE, 3, 7);

        if (this.buildingSquare) {

            const luxuryHouse = this.buildingSquare.buildings.find(
                b => b.id === BuildingSquareId.BUILDING_LUXURY_SQUARE_01
            );

            if (luxuryHouse) {
                placeBuildingSquare(world, 9, 4, luxuryHouse);
            }
        }

        return { world, objectLayer };
    }
}