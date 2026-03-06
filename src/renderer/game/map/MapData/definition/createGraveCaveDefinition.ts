// src/renderer/game/map/mapData/definition/createGraveCaveDefinition.ts

import { World } from "../../../../../shared/core/world";
import { MapId } from "../../../../../shared/type/MapId";
import { MapCategory, WORLD_DEFAULT_TILE } from "../../../../../shared/type/mapRules";
import { TileType } from "../../../../../shared/type/tileType";
import { ZonePx } from "../../../../../shared/type/ZonePx";
import { ZoneType } from "../../../../../shared/type/ZoneType";
import { addObject, addObjectBlock } from "../../objects/addObjectBlock";
import { ObjectLayer } from "../../objects/objectLayer";
import { ObjectType } from "../../objects/objectType";
import { fillRectTile } from "../../tiles/fillRectTile";
import { buildZones } from "../../zone/buildZone";
import { createMapsEvent } from "../createMapsEvent";
import { WorldDefinition } from "./WorldDefinition";

export function createGraveCaveDefinition(): WorldDefinition {
    const world = new World(100, 150, WORLD_DEFAULT_TILE[MapCategory.DUNGEON]);
    const objectLayer = new ObjectLayer();

    const mapData = createMapsEvent()[MapId.GRAVE_CAVE];

    // ========================
    // タイル構築
    // ========================
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
    // ========================
    // Zone統合
    // ========================

    const zoneGroups = mapData.zones;

    const zones: ZonePx[] = [
        ...buildZones(zoneGroups.entry ?? []),
        ...buildZones(zoneGroups.fieldEnemy ?? []),
        ...buildZones(zoneGroups.ramdomEnemyEncount ?? []),
        ...buildZones(zoneGroups.areas ?? []),
        ...buildZones(zoneGroups.triggers ?? []),
        ...buildZones(zoneGroups.warps ?? []),
        ...buildZones(zoneGroups.obstacles ?? []),
    ];
    // ========================
    // NPCブロックゾーン追加
    // ========================

    if (mapData.npcs) {
        zones.push(
            ...buildZones(
                mapData.npcs.map(npc => ({
                    tx: npc.tx,
                    ty: npc.ty,
                    w: npc.w ?? 1,
                    h: npc.h ?? 1,
                    block: true,
                    type: ZoneType.NPC
                }))
            )
        );
    }
    // ========================
    // 完成Definition
    // ========================

    return {
        world,
        objectLayer,
        zones,
        npcs: mapData.npcs ?? [],
        signs: mapData.signs ?? [],
        items: mapData.items ?? []
    };
}
