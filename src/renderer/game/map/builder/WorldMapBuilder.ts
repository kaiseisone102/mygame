// src/renderer/game/map/builder/WorldMapBuilder.ts

import { World } from "../../../../shared/core/world";
import { WORLD_DEFAULT_TILE, MapCategory } from "../../../../shared/type/mapRules";
import { TileType } from "../../../../shared/type/tileType";
import { addObjectBlock, addObject } from "../objects/addObjectBlock";
import { ObjectLayer } from "../objects/objectLayer";
import { ObjectType } from "../objects/objectType";
import { fillRectTile } from "../tiles/fillRectTile";
import { BaseWorldDefinition } from "./interface/definition/WorldDefinition";
import { MapBuilder } from "./interface/MapBuilder";

export class WorldMapBuilder implements MapBuilder {

    build(): BaseWorldDefinition {

        const world = new World(200, 200, WORLD_DEFAULT_TILE[MapCategory.FIELD]);
        const objectLayer = new ObjectLayer();

        world.ensureChunk(0, 0);

        fillRectTile(world, 0, 199, 1, 199, TileType.PLAIN);
        fillRectTile(world, 50, 10, 149, 199, TileType.DIRT);
        fillRectTile(world, 30, 30, 50, 50, TileType.WOOD_FLOOR);
        fillRectTile(world, 30, 29, 30, 51, TileType.WALL);
        fillRectTile(world, 50, 29, 50, 51, TileType.WALL);
        fillRectTile(world, 20, 30, 20, 30, TileType.WATER);
        fillRectTile(world, 20, 190, 74, 195, TileType.FOREST);

        addObject(objectLayer, ObjectType.TREE, 5, 190);
        addObject(objectLayer, ObjectType.THRONE, 5, 180);

        return { world, objectLayer };
    }
}