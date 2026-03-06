// shared/type/battle/result/SkillResult.ts

import { SkillEffectKindId } from "../skill/skillFormula";

export type SkillResult =
    | DamageResult
    | HealResult
    | StatusResult
    | BuffResult;

export interface DamageResult {
    kind: typeof SkillEffectKindId.DAMAGE;
    sourceId: number;
    targetId: number;
    value: number;
    isCritical: boolean;
    killed: boolean;
}

export interface HealResult {
    kind: typeof SkillEffectKindId.HEAL;
    sourceId: number;
    targetId: number;
    value: number;
}

export interface StatusResult {
    kind: typeof SkillEffectKindId.STATUS;
    sourceId: number;
    targetId: number;
    statusId: string;
}

export interface BuffResult {
    kind: typeof SkillEffectKindId.BUFF;
    sourceId: number;
    targetId: number;
    buffId: string;
}
