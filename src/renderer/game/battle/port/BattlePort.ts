import { BattleInput } from "../../../../renderer/router/useCase/gameUseCase/battle/BattleInputUseCase";
import { BattleState } from "../core/BattleState";
import { CommandActionType } from "../../../../shared/type/battle/TargetType";
import { SkillId, SkillPreset } from "../../../../shared/master/battle/type/SkillPreset";
import { BattleEnemy } from "../../../../renderer/screens/battleScene/overlayScreen/AttackTargetOverlay";

export interface BattlePort {

    requestCommand(actorId: number, actorName: string, enemies: BattleEnemy[]): Promise<BattleInput>;
    resolvePlayerInput(inputResult: BattleInput): void;
    isPlayer(actorId: number): boolean;
    addBattleLog(message: string): void;
    getSkillFromItem(itemId: string): SkillPreset | undefined;
}

export interface BattleAI {
    decide(actorId: number, state: BattleState): Promise<BattleInput>;
}

export class SimpleAI implements BattleAI {

    async decide(actorId: number, state: BattleState): Promise<BattleInput> {

        const enemy = state.enemies.find(e => e.alive)!;

        return {
            commandId: CommandActionType.ATTACK,
            actorId: actorId,
            actorName: `${actorId}`,
            enemy: [],
            skillId: SkillId.ATTACK,
            targetId: enemy.id
        };
    }
}