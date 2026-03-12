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

    constructor(private buildingSquare: BuildingSquare){};
    
    build(): BaseWorldDefinition {

        const world = new World(30, 35, WORLD_DEFAULT_TILE[MapCategory.TOWN]);
        const objectLayer = new ObjectLayer();

        world.ensureChunk(0, 0);

        fillRectTile(world, 0, 29, 0, 34, TileType.PLAIN);
        fillRectTile(world, 12, 18, 25, 34, TileType.DIRT);
        fillRectTile(world, 13, 6, 19, 14, TileType.WOOD_FLOOR);
        fillRectTile(world, 12, 12, 5, 15, TileType.WALL);
        fillRectTile(world, 20, 20, 5, 15, TileType.WALL);
        fillRectTile(world, 13, 20, 5, 5, TileType.WALL);
        fillRectTile(world, 20, 20, 30, 30, TileType.WATER);

        addObjectBlock(objectLayer, ObjectType.TREE, 2, 18, 5, 4);
        addObject(objectLayer, ObjectType.THRONE, 15, 7);

                if (this.buildingSquare) {
        
                    const luxuryHouse = this.buildingSquare.buildings.find(
                        b => b.id === BuildingSquareId.BUILDING_LUXURY_SQUARE_01
                    );
        
                    if (luxuryHouse) {
                        placeBuildingSquare(world, 12, 20, luxuryHouse);
                    }
                }

        return { world, objectLayer };
    }
}