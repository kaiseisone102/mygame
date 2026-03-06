// shared/master/battle/type/EncounterTable.ts

export interface EncounterEntry {
    enemyId: string;   // EnemyPreset のID
    weight: number;    // 出現確率用
    min?: number;      // 最低出現数
    max?: number;      // 最大出現数
}

export interface EncounterTable {
    encounterRate: number; // 歩行1歩あたりの発生確率
    entries: EncounterEntry[];
}
