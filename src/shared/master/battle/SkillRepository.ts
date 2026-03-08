// src/shared/master/battle/SkillRepository.ts

import { SkillId, SkillPreset } from "./type/SkillPreset";

export class SkillRepository {

    private skills: Record<SkillId, SkillPreset>;

    constructor(data: Record<SkillId, SkillPreset>) {
        this.skills = data;
    }

    get(id: SkillId): SkillPreset {
        const skill = this.skills[id];
        if (!skill) throw new Error(`Skill not found: ${id}`);
        return skill;
    }

    getAll(): SkillPreset[] {
        return Object.values(this.skills);
    }
}