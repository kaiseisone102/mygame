// shared/type/battle/result/SkillResult.ts

import { SkillEffectKindId } from "../skill/skillFormula";

export type SkillResult =
    | DamageResult
    | HealResult
    | StatusResult
    | BuffResult
    | EscapeResult;

export interface DamageResult {
    kind: typeof SkillEffectKindId.DAMAGE;
    instanceId: number;
    targetId: number;
    value: number;
    isCritical: boolean;
    killed: boolean;
    success?: boolean; // ミス用
}

export interface HealResult {
    kind: typeof SkillEffectKindId.HEAL;
    instanceId: number;
    targetId: number;
    value: number;
    success?: boolean;
}

export interface StatusResult {
    kind: typeof SkillEffectKindId.STATUS;
    instanceId: number;
    targetId: number;
    statusId: string;
    success?: boolean;
}

export interface BuffResult {
    kind: typeof SkillEffectKindId.BUFF;
    instanceId: number;
    targetId: number;
    buffId: string;
    success?: boolean;
}
export interface EscapeResult {
    kind: typeof SkillEffectKindId.ESCAPE;
    instanceId: number;
    targetId: number;
    success: boolean;
}
