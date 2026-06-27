import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { GameState } from "../../../../../shared/data/gameState";
import { OverlayScreenType } from "../../../../../shared/type/screenType";
import { GoldHudUseCase } from "./GoldHudUseCase";

export class ShowFieldCommand {
    constructor(private gameState: GameState, private emitUI: (e: AppUIEvent) => void, private goldHudUseCase: GoldHudUseCase) { };

    execute() {
        const updatedStatus = this.gameState.getAllyStatusList();
        this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.ALLIES_STATUS_OVERLAY, payload: { allies: updatedStatus } });

        this.goldHudUseCase.show();

        const fieldMagic = this.gameState.getFieldMagicPayload();
        this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.FIELD_COMMAND, payload: fieldMagic });
    }
}