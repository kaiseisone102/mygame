import { EncounterTableJson, BiomeId } from "../../../../../shared/type/battle/enemy/BiomeId";
import { EnemyTemplateId } from "../../../../../shared/Json/enemy/EnemyTemplate";

export class EncounterRepository {
    constructor(private table: EncounterTableJson) {}

    getEnemyIds(biomeId: BiomeId): EnemyTemplateId[] {
        return this.table[biomeId] ?? [];
    }
}