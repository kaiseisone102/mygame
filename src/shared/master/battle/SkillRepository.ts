// src/shared/master/battle/SkillRepository.ts

import { BuffPower, BuffPowerKey } from "../../type/battle/status/BuffPower";
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

/**
 * 文字列のパワーを数値に変換する
 */
export function getBuffPowerValue(powerKey: BuffPowerKey | number): number {
    // すでに数値（0.2 など）が入っている場合はそのまま返す
    if (typeof powerKey === "number") return powerKey;

    // BuffPower に定義されている文字列ならその数値を、なければ 0 を返す
    const power = BuffPower[powerKey as BuffPowerKey] ?? 0;
  
    return power;
}