// src/renderer/game/map/createWorldMapDefinition.ts

import { World } from "../../../../../shared/core/world";
import { TileType } from "../../../../../shared/type/tileType";
import { WORLD_DEFAULT_TILE, MapCategory } from "../../../../../shared/type/mapRules";
import { addObject } from "../../objects/addObjectBlock";
import { ObjectLayer } from "../../objects/objectLayer";
import { ObjectType } from "../../objects/objectType";
import { fillRectTile } from "../../tiles/fillRectTile";
import { buildZones } from "../../zone/buildZone";
import { createMapsEvent } from "../createMapsEvent";
import { MapId } from "../../../../../shared/type/MapId";
import { WorldDefinition } from "./WorldDefinition";
import { ZonePx } from "../../../../../shared/type/ZonePx";
import { ZoneType } from "../../../../../shared/type/ZoneType";

export function createWorldMapDefinition(): WorldDefinition {
    const world = new World(200, 200, WORLD_DEFAULT_TILE[MapCategory.FIELD]);
    const objectLayer = new ObjectLayer();

    const mapData = createMapsEvent()[MapId.WORLD_MAP];

    world.ensureChunk(0, 0);
    // ====================
    // ベース地形
    // ====================
    fillRectTile(world, 0, 199, 1, 199, TileType.PLAIN);

    // ====================
    // 道（縦に伸びる土）
    // ====================
    fillRectTile(world, 50, 10, 149, 199, TileType.DIRT);

    // ====================
    // 建物エリア（木床）
    // ====================
    fillRectTile(world, 30, 30, 50, 50, TileType.WOOD_FLOOR);

    // ====================
    // 壁
    // ====================
    fillRectTile(world, 30, 29, 30, 51, TileType.WALL); // 左
    fillRectTile(world, 50, 29, 50, 51, TileType.WALL); // 右
    fillRectTile(world, 29, 51, 51, 51, TileType.WALL); // 下

    // ====================
    // 池
    // ====================
    fillRectTile(world, 20, 30, 20, 30, TileType.WATER);

    // ====================
    // 森エリア
    // ====================
    fillRectTile(world, 20, 190, 74, 195, TileType.FOREST);

    // ====================
    // オブジェクト
    // ====================
    addObject(objectLayer, ObjectType.TREE, 5, 190);
    addObject(objectLayer, ObjectType.THRONE, 5, 180);

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