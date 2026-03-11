import { EncounterTableJson, BiomeId } from "../../../../../shared/type/battle/enemy/BiomeId";
import { EnemyKey } from "../../../../../shared/Json/enemy/EnemyTemplateJson";

export class EncounterRepository {
    constructor(private table: EncounterTableJson) {}

    getEnemyIds(biomeId: BiomeId): EnemyKey[] {
        return this.table[biomeId] ?? [];
    }
}