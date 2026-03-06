// src/shared/master/battle/SkillRepository.ts

import { SkillPreset } from "./type/SkillPreset";

export class SkillRepository {

    private skills: Record<string, SkillPreset>;

    constructor(data: Record<string, SkillPreset>) {
        this.skills = data;
    }

    get(id: string): SkillPreset {
        const skill = this.skills[id];
        if (!skill) throw new Error(`Skill not found: ${id}`);
        return skill;
    }

    getAll(): SkillPreset[] {
        return Object.values(this.skills);
    }
}