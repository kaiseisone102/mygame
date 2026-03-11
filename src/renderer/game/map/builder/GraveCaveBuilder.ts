// src/renderer/game/map/builder/GraveCaveBuilder.ts

import { World } from "../../../../shared/core/world";
import { WORLD_DEFAULT_TILE, MapCategory } from "../../../../shared/type/mapRules";
import { TileType } from "../../../../shared/type/tileType";
import { addObjectBlock, addObject } from "../objects/addObjectBlock";
import { ObjectLayer } from "../objects/objectLayer";
import { ObjectType } from "../objects/objectType";
import { fillRectTile } from "../tiles/fillRectTile";
import { BaseWorldDefinition } from "./interface/definition/WorldDefinition";
import { MapBuilder } from "./interface/MapBuilder";

export class GraveCaveBuilder implements MapBuilder {

    build(): BaseWorldDefinition {

        const world = new World(100, 150, WORLD_DEFAULT_TILE[MapCategory.DUNGEON]);
        const objectLayer = new ObjectLayer();

        world.ensureChunk(0, 0);

        fillRectTile(world, 1, 98, 1, 148, TileType.CAVEFLOOR);
        fillRectTile(world, 0, 99, 0, 0, TileType.CAVEWALL);
        fillRectTile(world, 0, 99, 149, 149, TileType.CAVEWALL);
        fillRectTile(world, 0, 0, 1, 148, TileType.CAVEWALL);
        fillRectTile(world, 99, 99, 1, 148, TileType.CAVEWALL);
        fillRectTile(world, 10, 30, 15, 40, TileType.CAVEWALL);
        fillRectTile(world, 10, 30, 120, 140, TileType.WATER);
        fillRectTile(world, 50, 70, 10, 30, TileType.LAVA)

        addObjectBlock(objectLayer, ObjectType.TREE, 10, 110, 3, 1);
        addObject(objectLayer, ObjectType.THRONE, 10, 116);

        return { world, objectLayer };
    }
}