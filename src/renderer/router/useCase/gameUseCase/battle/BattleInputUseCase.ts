// src/renderer/router/useCase/gameUseCase/battle/BattleInputUseCase.ts

import { BattlePort } from "../../../../../renderer/game/battle/port/BattlePort";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { BattleEnemy } from "../../../../../renderer/screens/battleScene/overlayScreen/AttackTargetOverlay";
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
    skillId: SkillId;
    enemy: BattleEnemy[];
    targetId: number;
}
