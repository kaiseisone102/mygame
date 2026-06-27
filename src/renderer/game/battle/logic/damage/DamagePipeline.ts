// src/renderer/game/battle/logic/damage/DamagePipeline.ts

import { Battler } from "../../core/Battler";
import { SkillEffect } from "../../../../../shared/type/battle/skill/SkillEffect";
import { SkillPreset } from "../../../../../shared/master/battle/type/SkillPreset";
import { Element, ElementId, MagicFormulaId, PhysicalFormulaId, SkillEffectKindId } from "../../../../../shared/type/battle/skill/skillFormula";
import { TraitRunner } from "../traits/TraitRunner";

/** スキルの DAMAGE 効果1つ分(formula / power / rate / element) */
type DamageSkillEffect = Extract<SkillEffect, { type: typeof SkillEffectKindId.DAMAGE }>;

/**
 * ダメージ計算の途中状態。各ステージがこれを受け取り amount とフラグを更新する。
 *
 * 介入(バフ・特性・属性・会心・ガード…)を増やしたいときは、
 * 新しいステージ関数を1つ書いて DAMAGE_PIPELINE に差し込むだけでよい。
 * 1つの巨大関数に if を足していく必要がない。
 */
export interface DamageContext {
    readonly source: Battler;
    readonly target: Battler;
    readonly skill: SkillPreset;
    readonly effect: DamageSkillEffect;
    readonly element: Element;

    amount: number;        // 計算途中のダメージ値
    isCritical: boolean;
    isWeakness: boolean;
    isResist: boolean;
}

/** 1ステージ = ctx を読んで amount / フラグを更新する関数 */
export type DamageStage = (ctx: DamageContext) => void;

/** 物理系(会心が乗る式)かどうか */
function isPhysical(formula: DamageSkillEffect["formula"]): boolean {
    return formula === PhysicalFormulaId.ATK_DEF || formula === PhysicalFormulaId.ATK_RATE;
}

/* ============================================================
   各ステージ(介入式)
   ============================================================ */

/**
 * 0. 会心判定。物理系のみ。source.critical を確率(%)として判定し、計算より先に決める。
 *    (ダメージ式そのものを切り替えるため、最初に確定させておく)
 */
const rollCritical: DamageStage = (ctx) => {
    if (!isPhysical(ctx.effect.formula)) return;

    const chance = (ctx.source.baseStats.critical ?? 0) / 100;
    if (Math.random() < chance) {
        ctx.isCritical = true;
    }
};

/**
 * 1. 基本ダメージ。式に応じて算出する。
 *    ステータスは必ず最終値 getter(source.attack 等 = 特性 BERSERKER + バフ ATK_UP/DOWN 反映後)を使う。
 *    会心は「威力(技の倍率込み)を2倍する」だけ。その後の防御減算・対象特性(applyTraits)は通常どおり乗る。
 *    例: バックスタブ atk×3 → 会心で atk×6、そこから対象の防御・耐性が引かれる。
 */
const baseFormula: DamageStage = (ctx) => {
    const { source, target, effect } = ctx;
    const critMul = ctx.isCritical ? 2 : 1; // 会心は威力を2倍(防御・耐性はこの後で通常どおり適用)

    switch (effect.formula) {
        case PhysicalFormulaId.ATK_DEF:
            // 威力(atk)を会心で2倍したのち、防御を引く
            ctx.amount = source.attack * critMul - target.defense;
            break;

        case PhysicalFormulaId.ATK_RATE:
            ctx.amount = source.attack * (effect.rate ?? 1) * critMul;
            break;

        case MagicFormulaId.MAGIC:
            ctx.amount = (source.magic * (effect.rate ?? 1) + (effect.power ?? 0)) * critMul;
            break;

        case PhysicalFormulaId.FIXED:
            ctx.amount = (effect.power ?? 0) * critMul;
            break;

        default:
            ctx.amount = (effect.power ?? 0) * critMul;
    }
};

/**
 * 2. 特性介入。対象の Trait.onDamage(属性耐性・カテゴリ耐性)を順に適用する。
 *    会心でも対象の耐性は無視しない(威力2倍の後に、ここで耐性が乗る)。
 */
const applyTraits: DamageStage = (ctx) => {
    const result = TraitRunner.applyDamageTraits(
        { source: ctx.source, target: ctx.target, skill: ctx.skill, element: ctx.element, damage: ctx.amount },
        ctx.target.traits
    );
    ctx.amount = result.damage;
    ctx.isWeakness = result.isWeakness;
    ctx.isResist = result.isResist;
};

/** 3. ぼうぎょ。対象がぼうぎょ中なら被ダメージ半減。 */
const guard: DamageStage = (ctx) => {
    if (ctx.target.isGuarding()) {
        ctx.amount *= 0.5;
    }
};

/** 4. ばらつき。±10%。 */
const variance: DamageStage = (ctx) => {
    ctx.amount *= 0.9 + Math.random() * 0.2;
};

/** 5. 整形。最低1・整数化。 */
const clamp: DamageStage = (ctx) => {
    ctx.amount = Math.max(1, Math.floor(ctx.amount));
};

/**
 * ダメージパイプライン本体(上から順に適用)。
 * 介入の追加・順序変更・差し替えはこの配列をいじるだけ。
 */
export const DAMAGE_PIPELINE: DamageStage[] = [
    rollCritical,
    baseFormula,
    applyTraits,
    guard,
    variance,
    clamp,
];

/**
 * スキルの DAMAGE 効果1つ分のダメージを、パイプラインを通して計算する。
 */
export function runDamagePipeline(
    source: Battler,
    target: Battler,
    skill: SkillPreset,
    effect: DamageSkillEffect
): DamageContext {
    const ctx: DamageContext = {
        source,
        target,
        skill,
        effect,
        element: effect.element ?? skill.element ?? ElementId.NONE,
        amount: 0,
        isCritical: false,
        isWeakness: false,
        isResist: false,
    };

    for (const stage of DAMAGE_PIPELINE) {
        stage(ctx);
    }

    return ctx;
}
