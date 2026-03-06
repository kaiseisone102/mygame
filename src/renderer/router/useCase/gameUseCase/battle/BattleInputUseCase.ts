
import { CommandActionType, TargetType } from "../../../../../shared/type/battle/TargetType";
import { BattlePort } from "../../../../../renderer/game/battle/port/BattlePort";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { SkillPreset } from "../../../../../shared/master/battle/type/SkillPreset";
import { OverlayScreenType } from "../../../../../shared/type/screenType";

export class BattleInputUseCase {
    private skill?: SkillPreset = undefined;

    constructor(
        private battlePort: BattlePort,
        private emitUI: (e: AppUIEvent) => void
    ) { }

    execute(input: BattleInput) {
        this.battlePort.resolvePlayerInput(input);
    }

    onItemSelected(itemId: string) {

        const skill = this.battlePort.getSkillFromItem(itemId);

        if (!skill) return;

        switch (skill.targetType) {
            case TargetType.SINGLE_ENEMY:
                this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.ATTACK_TARGET_OVERLAY, payload: { enemies: [], skill: skill } });
                break;

            case TargetType.SINGLE_ALLY: // 仮
                this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.ATTACK_TARGET_OVERLAY, payload: { enemies: [], skill: skill } });
                break;

            case TargetType.ALL_ENEMIES:
            case TargetType.ALL_ALLIES:
                // 即実行可能
                this.execute({
                    commandId: CommandActionType.ITEM,
                    skill,
                    targetId: 0
                });
                break;
        }
    }
}

export type BattleInput =
    | {
        commandId: typeof CommandActionType.ATTACK | typeof CommandActionType.MAGIC;
        skillId: string;
        targetId: number;
    }
    | {
        commandId: typeof CommandActionType.ITEM;
        skill: SkillPreset;
        targetId: number;
    }
    | {
        commandId: typeof CommandActionType.DEFENCE | typeof CommandActionType.ESCAPE;
        skillId: string;
        targetId: number;
    };
