// src/shared/battle/traits/Trait.ts

import { TraitPreset } from "../../../master/battle/TraitPresets";
import { SkillPreset } from "../../../master/battle/type/SkillPreset";
import { BattleAction } from "../BattleAction";
import { BattlerPort } from "../port/BattlerPort";
import { Skill } from "../skill/Skill";
import { TraitType, DamageContext, HealContext } from "./TraitType";

/**
 * if文を書かないための「フック定義」
 */
export type Trait = {
    id: TraitPreset;
    // UI / セーブ / 判定用
    tags?: string[];

    type: TraitType;

    value?: number;

    // ダメージ計算に介入
    onDamage?: (ctx: DamageContext) => number;

    // 回復計算に介入
    onHeal?: (ctx: HealContext) => number;

    // MP消費に介入
    onMpCost?: (cost: number, skill: SkillPreset) => number;

    // ターン開始時
    onTurnStart?: (battler: BattlerPort) => void;

    // ターン終了時
    onTurnEnd?: (battler: BattlerPort) => void;

    // 行動前（行動を書き換え可能）
    onBeforeAction?: (action: BattleAction) => BattleAction | undefined;
};
