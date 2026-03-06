import { MainScreenType } from "../../../../../../shared/type/screenType";
import { ChangeMainScreenUseCase } from "../../screen/ChangeMainUseCase";

export class EnterForestTempleUseCase {
    constructor(
        private changeMain: ChangeMainScreenUseCase,
    ) { }

    execute() {
        this.changeMain.execute(MainScreenType.FOREST_TEMPLE);
    }
}
