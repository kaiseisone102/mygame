// src/renderer/game/battle/port/BattlePort.ts

import { BattleInput } from "../../../../renderer/router/useCase/gameUseCase/battle/BattleInputUseCase";
import { BattleState } from "../core/BattleState";
import { CommandActionType } from "../../../../shared/type/battle/TargetType";
import { SkillPreset, TechniqueId } from "../../../../shared/master/battle/type/SkillPreset";
import { BattleEnemy } from "../../../../renderer/screens/battleScene/overlayScreen/AttackTargetOverlay";
import { SkillItem } from "../../../../renderer/screens/battleScene/overlayScreen/SkillSelectOverlay";

export interface BattlePort {

    requestCommand(actorTemplateId: number, actorInstanceId: number, actorName: string, skills: SkillItem[], enemies: BattleEnemy[]): Promise<BattleInput>;
    resolvePlayerInput(inputResult: BattleInput): void;
    isPlayer(actorId: number): boolean;
    addBattleLog(message: string): void;
    getSkillFromItem(itemId: string): SkillPreset | undefined;
}

export interface BattleAI {
    decide(actorTemplateId: number, actorInstanceId: number, state: BattleState): Promise<BattleInput>;
}

export class SimpleAI implements BattleAI {

    async decide(actorTemplateId: number, actorInstanceId: number, state: BattleState): Promise<BattleInput> {

        const enemy = state.enemies.find(e => e.alive)!;

        return {
            commandId: CommandActionType.ATTACK,
            actorTemplateId: actorTemplateId,
            actorInstanceId: actorInstanceId,
            actorName: `${actorTemplateId}`,
            enemy: [],
            skillId: TechniqueId.ATTACK,
            targetId: enemy.instanceId
        };
    }
}