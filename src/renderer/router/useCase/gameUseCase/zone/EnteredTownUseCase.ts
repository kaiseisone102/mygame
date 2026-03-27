import { MapId } from "../../../../../shared/type/MapId";
import { ZoneObject } from "../../../../../shared/type/zone/ZoneObject";
import { ZoneContext } from "../../../../../shared/type/ZoneEvent";
import { ChangeWorldUseCase } from "../world/ChangeWorldUseCase";

export class EnteredTownUseCase {

    constructor(private changeWorldUseCase: ChangeWorldUseCase) { }

    execute(event: { zone: ZoneObject, ctx: ZoneContext }) {
        const zoneId = event.zone.id;

        switch (zoneId) {
            // to カス村
            case "WORLD_MAP_ENTRY_01":
                this.changeWorldUseCase.execute(MapId.NO_FEATURE_TOWN, { tx: 2, ty: 11 });
                break;

            // to ワールドマップ
            case "NF_TOWN_ENTRY_01":
                this.changeWorldUseCase.execute(MapId.WORLD_MAP, { tx: 1, ty: 195 });
                break;
            case "NF_TOWN_ENTRY_02":
                this.changeWorldUseCase.execute(MapId.WORLD_MAP, { tx: 5, ty: 197 });
                break;
            case "G_CAVE_ENTRY_01":
                this.changeWorldUseCase.execute(MapId.WORLD_MAP, { tx: 31, ty: 183 });
                break;
            case "FOREST_T_ENTRY_01":
                this.changeWorldUseCase.execute(MapId.WORLD_MAP, { tx: 21, ty: 192 });
                break;

            // to 墓洞窟
            case "WORLD_MAP_ENTRY_02":
                this.changeWorldUseCase.execute(MapId.GRAVE_CAVE, { tx: 9, ty: 33 });
                break;

            // to 森殿
            case "WORLD_MAP_ENTRY_03":
                this.changeWorldUseCase.execute(MapId.FOREST_TEMPLE, { tx: 15, ty: 32 });
                break;

            default:
                console.warn("[WorldEventRouter] 未登録のENTRYゾーンID:", zoneId);
                break;
        }
    }
}