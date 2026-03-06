import { ZoneContext } from "../../../../../shared/type/ZoneEvent";
import { ChangeWorldUseCase } from "../world/ChangeWorldUseCase";

export class EnteredTownUseCase {

    constructor(private changeWorldUseCase: ChangeWorldUseCase) { }

    execute(ctx: ZoneContext) {
        this.changeWorldUseCase.execute(ctx.mapId);
    }
}