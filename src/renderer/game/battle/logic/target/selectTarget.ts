// src/shared/battle/target/selectTargets.ts

import { BattleState } from "@/renderer/game/battle/core/BattleState";
import { Battler } from "../../core/Battler";
import { Skill } from "../../../../../shared/type/battle/skill/Skill";

export function selectTargets(
    state: BattleState,
    attacker: Battler,
    skill: Skill,
    selectedId?: number
): Battler[] {

    const candidates =
        skill.targetSide === "ENEMY"
            ? state.enemies
            : skill.targetSide === "ALLY"
            ? state.allies
            : [attacker];

    const alive = candidates.filter(b => b.hp > 0);

    switch (skill.effectScope) {
        case "SINGLE":
            return alive.filter(b => b.id === selectedId);

        case "GROUP":
            return alive.slice(0, 3); // 仮

        case "ALL":
            return alive;
    }
}
