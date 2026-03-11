// src/renderer/game/battle/ally/repositoy/AllyRepository.ts

import { AllyKey, AllyMasterJson, AllyTemplateJson } from "../../../../../shared/Json/ally/AllyTemplateJson";

export class AllyRepository {
    constructor(private master: AllyMasterJson) { }

    get(allyKey: AllyKey): AllyTemplateJson {
        const ally = this.master[allyKey];

        if (!ally) {
            throw new Error(`Ally not found: ${allyKey}`);
        }

        return ally;
    }
}