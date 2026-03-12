// src/renderer/game/map/builder/WorldDefinitionBuilder.ts

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

    static build(world: World, objectLayer: ObjectLayer, mapJson: MapJson): WorldDefinition {

        const zones: ZonePx[] = WorldDefinitionBuilder.buildGenericZone(mapJson.zones);

        const npcs = WorldDefinitionBuilder.buildGeneric(mapJson.npcs, toNpcTile, buildNpcs);
        const signs = WorldDefinitionBuilder.buildGeneric(mapJson.signs, toSignTile, buildSigns);
        const items = WorldDefinitionBuilder.buildGeneric(mapJson.items, toItemTile, buildItems);

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

    // -----------------------------
    // ゾーン用（型が少し特殊なので別メソッド）
    // -----------------------------
    private static buildGenericZone(zoneJsons: Record<string, any[]>): ZonePx[] {
        const zones: ZonePx[] = [];

        for (const key in zoneJsons) {
            const typeKey = key as keyof typeof ZoneType;
            const zoneList = zoneJsons[typeKey];
            if (!zoneList) continue;

            const zoneTiles = zoneList.map(z => toZoneTile(typeKey, z));
            zones.push(...buildZones(zoneTiles));
        }

        return zones;
    }

    // -----------------------------
    // 汎用メソッド
    // JSON配列 → タイルDTO → ゲームデータ
    // -----------------------------
    private static buildGeneric<TJson, TDto, TData>(
        jsonArr: TJson[] | undefined,
        toDto: (dto: TJson) => TDto,
        build: (dtoArr: TDto[]) => TData[]
    ): TData[] {
        if (!jsonArr) return [];
        const dtoArr = jsonArr.map(toDto);
        return build(dtoArr);
    }
}