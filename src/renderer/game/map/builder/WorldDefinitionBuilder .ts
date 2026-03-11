import { World } from "../../../../shared/core/world";
import { MapJson } from "../../../../shared/Json/map/MapJson";
import { ZonePx } from "../../../../shared/type/ZonePx";
import { ZoneType } from "../../../../shared/type/ZoneType";
import { buildItems, toItemTile } from "../dto/ItemDtoMapper";
import { buildNpcs, toNpcTile } from "../dto/NpcDtoMapper";
import { buildSigns, toSignTile } from "../dto/SignDtoMapper";
import { buildZones, toZoneTile } from "../dto/ZoneDtoMapper";
import { ObjectLayer } from "../objects/objectLayer";
import { WorldDefinition } from "./interface/definition/WorldDefinition";

export class WorldDefinitionBuilder {

    static build(
        world: World,
        objectLayer: ObjectLayer,
        mapJson: MapJson
    ): WorldDefinition {

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