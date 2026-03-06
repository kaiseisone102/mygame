import type { Battler } from "../core/Battler";

export function buildTurnOrder(
    allies: Battler[],
    enemies: Battler[]
): Battler[] {
    return [...allies, ...enemies]
        .filter(b => b.hp > 0)
        .sort((a, b) => b.speed - a.speed); // 素早さ順
}
