// src/renderer/game/map/createTownDefinition.ts

import { World } from "../../../../../shared/core/world";
import { TileType } from "../../../../../shared/type/tileType";
import { WORLD_DEFAULT_TILE, MapCategory } from "../../../../../shared/type/mapRules";
import { addObjectBlock, addObject } from "../../objects/addObjectBlock";
import { ObjectLayer } from "../../objects/objectLayer";
import { ObjectType } from "../../objects/objectType";
import { fillRectTile } from "../../tiles/fillRectTile";
import { buildZones } from "../../zone/buildZone";
import { createMapsEvent } from "../createMapsEvent";
import { MapId } from "../../../../../shared/type/MapId";
import { WorldDefinition } from "./WorldDefinition";
import { ZonePx } from "../../../../../shared/type/ZonePx";
import { ZoneType } from "../../../../../shared/type/ZoneType";

export function createTownDefinition(): WorldDefinition {
    const world = new World(30, 35, WORLD_DEFAULT_TILE[MapCategory.TOWN]);
    const objectLayer = new ObjectLayer();

    const mapData = createMapsEvent()[MapId.NO_FEATURE_TOWN];

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
// map制作ながれ　src/game/map直下ファイル
// ① TileType,titleData ← タイルの種類定義
// ② isWalkable         ← 通行可否ルール
// ③ createWorld系      ← マップ内容を書く場所
//    +objectLayer追加  ← 大型タイルの位置
// ④ TileRenderer       ← 見た目