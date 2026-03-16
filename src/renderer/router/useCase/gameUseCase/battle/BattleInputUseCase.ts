// src/renderer/router/useCase/gameUseCase/battle/BattleInputUseCase.ts

import { BattlePort } from "../../../../../renderer/game/battle/port/BattlePort";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { BattleActor } from "../../../../screens/battleScene/overlayScreen/SelectTargetOverlay";
import { SkillId } from "../../../../../shared/master/battle/type/SkillPreset";
import { CommandActionType } from "../../../../../shared/type/battle/TargetType";

export class BattleInputUseCase {

    constructor(
        private battlePort: BattlePort,
        private emitUI: (e: AppUIEvent) => void
    ) { }

    execute(input: BattleInput) {
        this.battlePort.resolvePlayerInput(input);
    }

}

export type BattleInput = {
    commandId: CommandActionType;
    actorTemplateId: number;
    actorInstanceId: number;
    actorName: string;
    enemy: BattleActor[];
    skillId: SkillId;
    targetId: number;
}
