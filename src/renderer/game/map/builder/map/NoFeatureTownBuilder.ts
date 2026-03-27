// src/renderer/game/map/builder/NoFeatureTownBuilder.ts

import { World } from "../../../../../shared/core/world";
import { WORLD_DEFAULT_TILE, MapCategory } from "../../../../../shared/type/mapRules";
import { TileType } from "../../../../../shared/type/tileType";
import { addObjectBlock, addObject } from "../../objects/addObjectBlock";
import { ObjectLayer } from "../../objects/objectLayer";
import { ObjectType } from "../../objects/objectType";
import { fillRectTile } from "../../tiles/fillRectTile";
import { BuildingSquare } from "../../tiles/placeBuildingSquare";
import { BaseWorldDefinition } from "../interface/definition/WorldDefinition";
import { MapBuilder } from "../interface/MapBuilder";

export class NoFeatureTownBuilder implements MapBuilder {

    constructor(private buildingSquare: BuildingSquare) { };

    build(): BaseWorldDefinition {

        const world = new World(60, 20, WORLD_DEFAULT_TILE[MapCategory.TOWN]);
        const objectLayer = new ObjectLayer();

        world.ensureChunk(0, 0);

        // 地面
        fillRectTile(world, 0, 58, 1, 18, TileType.DIRT);
        fillRectTile(world, 28, 32, 19, 19, TileType.DIRT);

        // 草
        fillRectTile(world, 2, 15, 1, 9, TileType.PLAIN);
        fillRectTile(world, 2, 11, 12, 18, TileType.PLAIN);

        // 外壁
        fillRectTile(world, 0, 59, 0, 0, TileType.WALL);    // 上
        fillRectTile(world, 0, 27, 19, 19, TileType.WALL);   // 下(左)
        fillRectTile(world, 33, 59, 19, 19, TileType.WALL); // 下(右)
        fillRectTile(world, 59, 59, 0, 19, TileType.WALL);  // 右

        fillRectTile(world, 36, 39, 12, 15, TileType.WATER);
        fillRectTile(world, 40, 49, 12, 18, TileType.WATER);

        addObjectBlock(objectLayer, ObjectType.TREE, 4, 1, 3, 2);
        addObjectBlock(objectLayer, ObjectType.TREE, 4, 13, 2, 2);

        addObject(objectLayer, ObjectType.THRONE, 93, 8);

        return { world, objectLayer };
    }
}