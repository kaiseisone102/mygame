// src/shared/data/encounters/forest.ts

import { Slime } from "../enemies/slime";
import { createEnemy } from "../EnemyFactory";

export function createForestEncounter() {
    return [
        createEnemy(Slime),
        createEnemy(Slime),
    ];
}
