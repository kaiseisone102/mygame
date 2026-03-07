import { EnemyMasterJson, EnemyTemplateId, EnemyTemplateJson } from "../../../../../shared/Json/enemy/EnemyTemplate";

export class EnemyRepository {
    constructor(private master: EnemyMasterJson) {}

    get(templateId: EnemyTemplateId): EnemyTemplateJson {
        const enemy = this.master[templateId];

        if (!enemy) {
            throw new Error(`Enemy not found: ${templateId}`);
        }

        return enemy;
    }
}