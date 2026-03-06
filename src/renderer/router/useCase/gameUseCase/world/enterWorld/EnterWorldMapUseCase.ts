import { MainScreenType } from "../../../../../../shared/type/screenType";
import { ChangeMainScreenUseCase } from "../../screen/ChangeMainUseCase";

export class EnterWorldMapUseCase {
    constructor(
        private changeMain: ChangeMainScreenUseCase,
    ) { }

    execute() {
        this.changeMain.execute(MainScreenType.WORLD_MAP);
    }
}
