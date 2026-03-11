// src/renderer/game/battle/enemy/repositoy/EnemyRepository.ts

import { EnemyMasterJson, EnemyKey, EnemyTemplateJson } from "../../../../../shared/Json/enemy/EnemyTemplateJson";

export class EnemyRepository {
    constructor(private master: EnemyMasterJson) { }

    get(enemyKey: EnemyKey): EnemyTemplateJson {
        const enemy = this.master[enemyKey];

        if (!enemy) {
            throw new Error(`Enemy not found: ${enemyKey}`);
        }

        return enemy;
    }
}