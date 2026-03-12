// src/shared/type/battle/skill/skillFormula.ts

export const PhysicalFormulaId = {
    ATK_DEF: "ATK_DEF",   // 攻撃力 - 防御力
    ATK_RATE: "ATK_RATE",    // 攻撃力 × rate
    FIXED: "FIXED",     // 固定値
} as const;
export type PhysicalFormula = typeof PhysicalFormulaId[keyof typeof PhysicalFormulaId];

export const MagicFormulaId = {
    MAGIC: "MAGIC",
} as const;
export type MagicFormula = typeof MagicFormulaId[keyof typeof MagicFormulaId];

export const SkillEffectKindId = {
    HEAL: "HEAL", STATUS: "STATUS", BUFF: "BUFF", DAMAGE: "DAMAGE", ESCAPE: "ESCAPE"
} as const;
export type SkillEffectKindId = typeof SkillEffectKindId[keyof typeof SkillEffectKindId];

export type DamageFormula = PhysicalFormula | MagicFormula;

export const TargetSide = {
    ENEMY: "ENEMY", ALLY: "ALLY", SELF: "SELF",
} as const;
export type TargetSide = typeof TargetSide[keyof typeof TargetSide];

export const EffectScope = {
    SINGLE: "SINGLE", GROUP: "GROUP", ALL: "ALL",
} as const;
export type EffectScope = typeof EffectScope[keyof typeof EffectScope];

export const SkillCategory = {
    ATTACK: "ATTACK", MAGIC: "MAGIC", TECHNIQUE: "TECHNIQUE", BREATH: "BREATH", ITEM: "ITEM"
} as const;
export type SkillCategory = typeof SkillCategory[keyof typeof SkillCategory];

export const ElementId = {
    MAGIC: "MAGIC", FIRE: "FIRE", ICE: "ICE", ELECTRICITY: "ELECTRICITY", WIND: "WIND", IMPACT: "IMPACT",
    SLASH: "SLASH", PIERCING: "PIERCING", BLOW: "BLOW", NONE: "NONE"
}
export type Element = typeof ElementId[keyof typeof ElementId];
