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
export function getBuffPowerValue(powerKey: BuffPowerKey | number | string | undefined | null): number {
    // 未指定(value を持たない状態異常など)は補正 0
    if (powerKey == null) return 0;

    // すでに数値（0.2 など）が入っている場合はそのまま返す
    if (typeof powerKey === "number") return powerKey;

    // "-SMALL" のような負符号付きキーはデバフ。符号を外して引き、最後に反転する
    const negative = powerKey.startsWith("-");
    const key = (negative ? powerKey.slice(1) : powerKey) as BuffPowerKey;

    // BuffPower に定義されている文字列ならその数値を、なければ 0 を返す
    const power = BuffPower[key] ?? 0;

    return negative ? -power : power;
}