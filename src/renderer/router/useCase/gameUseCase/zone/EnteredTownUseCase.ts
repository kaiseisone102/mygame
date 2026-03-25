import { MapId } from "../../../../../shared/type/MapId";
import { ZoneObject } from "../../../../../shared/type/zone/ZoneObject";
import { ZoneContext } from "../../../../../shared/type/ZoneEvent";
import { ChangeWorldUseCase } from "../world/ChangeWorldUseCase";

export class EnteredTownUseCase {

    constructor(private changeWorldUseCase: ChangeWorldUseCase) { }

    execute(event: { zone: ZoneObject, ctx: ZoneContext }) {
        const zoneId = event.zone.id;

        switch (zoneId) {
            case "NF_TOWN_ENTRY_01":
                this.changeWorldUseCase.execute(MapId.NO_FEATURE_TOWN, { tx: 15, ty: 33 });
                break;

            case "G_CAVE_ENTRY_01":
                this.changeWorldUseCase.execute(MapId.GRAVE_CAVE, { tx: 5, ty: 33 });
                break;

            default:
                console.warn("[WorldEventRouter] 未登録のENTRYゾーンID:", zoneId);
                break;
        }
    }
}