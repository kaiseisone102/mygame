
import { World } from "../../../../shared/core/world";
import { MapJson } from "../../../../shared/map/MapJson";
import { WORLD_DEFAULT_TILE, MapCategory } from "../../../../shared/type/mapRules";
import { ZonePx } from "../../../../shared/type/ZonePx";
import { buildItems, toItemTile } from "../dto/ItemDtoMapper";
import { buildSigns, toSignTile } from "../dto/SignDtoMapper";
import { WorldDefinition } from "../MapData/definition/WorldDefinition";
import { ObjectLayer } from "../objects/objectLayer";
import { ZoneType } from "../../../../shared/type/ZoneType";
import { toNpcTile, buildNpcs } from "../dto/NpcDtoMapper";
import { buildZones, toZoneTile } from "../dto/ZoneDtoMapper";
import { TileType } from "../../../../shared/type/tileType";
import { addObjectBlock, addObject } from "../objects/addObjectBlock";
import { ObjectType } from "../objects/objectType";
import { fillRectTile } from "../tiles/fillRectTile";
import { MapId } from "../../../../shared/type/MapId";

export class WorldDefinitionFactory {

    create(mapJson: MapJson, mapId:MapId): WorldDefinition {

        // ======================
        // ① World生成
        // ======================

        const world = new World(30, 35, WORLD_DEFAULT_TILE[MapCategory.TOWN]);

        const objectLayer = new ObjectLayer();

        world.ensureChunk(0, 0);

        // ※ ここで将来 tileJson を読み込めるように拡張可能
        fillRectTile(world, 0, 29, 0, 34, TileType.PLAIN);
        fillRectTile(world, 12, 18, 25, 34, TileType.DIRT);
        fillRectTile(world, 13, 6, 19, 14, TileType.WOOD_FLOOR);
        fillRectTile(world, 12, 12, 5, 15, TileType.WALL);
        fillRectTile(world, 20, 20, 5, 15, TileType.WALL);
        fillRectTile(world, 13, 20, 5, 5, TileType.WALL);
        fillRectTile(world, 20, 20, 30, 30, TileType.WATER);

        addObjectBlock(objectLayer, ObjectType.TREE, 2, 18, 5, 4);
        addObject(objectLayer, ObjectType.THRONE, 15, 7);

        // ======================
        // ② Zones構築
        // ======================

        const zones: ZonePx[] = [];

        for (const key in mapJson.zones) {
            const typeKey = key as keyof typeof ZoneType;
            const zoneList = mapJson.zones[typeKey];

            if (!zoneList) continue;

            const zoneTiles = zoneList.map(zone => toZoneTile(typeKey, zone));

            zones.push(...buildZones(zoneTiles));
        }

        const npcTiles = (mapJson.npcs ?? []).map(npc => toNpcTile(npc));
        const npcs = buildNpcs(npcTiles);

        const signTiles = (mapJson.signs ?? []).map(sign => toSignTile(sign));
        const signs = buildSigns(signTiles);

        const itemTiles = (mapJson.items ?? []).map(item => toItemTile(item));
        const items = buildItems(itemTiles);

        // ======================
        // ③ Definition完成
        // ======================

        return {
            world,
            objectLayer,
            zones,
            npcs,
            signs,
            items,
            environment: mapJson.environment
        };
    }
}
