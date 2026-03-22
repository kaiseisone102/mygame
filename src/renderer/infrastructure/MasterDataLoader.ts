// src/renderer/infrastructure/MasterDataLoader.ts
import { SkillRepository } from "../../shared/master/battle/SkillRepository";
import { GrowTableJson } from "../../shared/Json/growTable/growTableJson";
import { SkillId, SkillPreset } from "../../shared/master/battle/type/SkillPreset";
import { EnemyMasterJson } from "../../shared/Json/enemy/EnemyTemplateJson";
import { EncounterTableJson } from "../../shared/type/battle/enemy/BiomeId";
import { EncounterRepository } from "../../renderer/game/battle/enemy/repository/EncounterRepository";
import { EnemyRepository } from "../../renderer/game/battle/enemy/repository/EnemyRepository";

export class MasterDataLoader {
    async load() {
        // 並列でフェッチを飛ばして高速化
        // NOTE:
        // Electron(file://) 用のため、asset は HTML 相対パスで指定する
        const [skillsJson, enemyMaster, encounterTable, allyGrowTable] = await Promise.all([
            fetch("master/skillMaster.json").then(r => r.json()) as Promise<Record<SkillId, SkillPreset>>,
            fetch("master/enemies/enemyMaster.json").then(r => r.json()) as Promise<EnemyMasterJson>,
            fetch("master/enemies/encounterTable.json").then(r => r.json()) as Promise<EncounterTableJson>,
            fetch("master/growTable.json").then(r => r.json()) as Promise<GrowTableJson>,
        ]);

        return {
            skillRepository: new SkillRepository(skillsJson),
            enemyRepository: new EnemyRepository(enemyMaster),
            encounterRepository: new EncounterRepository(encounterTable),
            allyGrowTable,
        };
    }
}