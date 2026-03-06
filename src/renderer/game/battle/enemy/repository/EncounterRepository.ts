export class EncounterRepository {
    constructor(private table: EncounterTableJson) {}

    getEnemyIds(areaId: string): string[] {
        return this.table[areaId] ?? [];
    }
}