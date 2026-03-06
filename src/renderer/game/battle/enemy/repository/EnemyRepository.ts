import { EnemyMasterJson, EnemyTemplateJson } from "../type/EnemyTemplate";

export class EnemyRepository {
    constructor(private master: EnemyMasterJson) {}

    get(templateId: string): EnemyTemplateJson {
        const enemy = this.master[templateId];

        if (!enemy) {
            throw new Error(`Enemy not found: ${templateId}`);
        }

        return enemy;
    }
}