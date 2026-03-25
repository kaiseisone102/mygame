// src/renderer/game/battle/port/BattlePort.ts

import { SkillItem } from "shared/type/payload/battle";
import { SkillPreset, TechniqueId } from "../../../../shared/master/battle/type/SkillPreset";
import { BattleActor, BattleInput, combatCommandInput } from "../../../../shared/type/battle/BattleAction";
import { BattleState } from "../core/BattleState";

export interface BattlePort {

    requestCommand(allies: BattleActor[], enemies: BattleActor[], skillItem: SkillItem[]): Promise<combatCommandInput>;
    resolvePlayerInput(inputResult: combatCommandInput): void;
    isPlayer(actorId: number): boolean;
    addBattleLog(message: string): void;
    getSkillFromItem(itemId: string): SkillPreset | undefined;
}

export interface BattleAI {
    decide(actorMasterId: number, actorInstanceId: number, state: BattleState): Promise<BattleInput>;
}

export class SimpleAI implements BattleAI {

    async decide(actorMasterId: number, actorInstanceId: number, state: BattleState): Promise<BattleInput> {

        const enemy = state.enemies.find(e => e.alive)!;

        return {
            actorMasterId: actorMasterId,
            actorInstanceId: actorInstanceId,
            actorName: `${actorMasterId}`,
            enemy: [],
            skillId: TechniqueId.ATTACK,
            targetId: enemy.instanceId
        };
    }
}
