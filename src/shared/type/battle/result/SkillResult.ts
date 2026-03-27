// shared/type/battle/result/SkillResult.ts

import { StatusId } from "../../../master/battle/StatusPreset";
import { SkillEffectKindId } from "../skill/skillFormula";

export type SkillResult =
    | DamageResult
    | HealResult
    | StatusResult
    | EscapeResult;

export interface DamageResult {
    kind: typeof SkillEffectKindId.DAMAGE;
    instanceId: number;
    targetId: number;
    value: number;
    options: {
        isCritical: boolean;
        isWeakness: boolean;
        isResist: boolean;
        sizeMultiplier?: number;
    },
    killed: boolean;
    success?: boolean; // ミス用
    statusId?: StatusId;  // 状態異常ログ用
}

export interface HealResult {
    kind: typeof SkillEffectKindId.HEAL;
    instanceId: number;
    targetId: number;
    value: number;
    success?: boolean;
    statusId?: StatusId;  // 状態異常ログ用
}

export interface StatusResult {
    kind: typeof SkillEffectKindId.STATUS;
    instanceId: number;
    targetId: number;
    statusId: string;
    success: boolean;
    // --- ログ・UI用プロパティ ---
    value?: number;      // バフの倍率やダメージ量
    preValue?: number;   // 適用前のステータス実数値
    postValue?: number;  // 適用後のステータス実数値
    attribute?: string;  // "attack", "defense" など (UIで「〇〇の攻撃力が…」と出す用)
    removed?: boolean;       // 解除されたことを示すフラグ
}

export interface EscapeResult {
    kind: typeof SkillEffectKindId.ESCAPE;
    instanceId: number;
    targetId: number;
    success: boolean;
}
