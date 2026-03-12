import { SkillItem } from "../../../../renderer/screens/battleScene/overlayScreen/SkillSelectOverlay";
import { MagicId, TechniqueId } from "../../../../shared/master/battle/type/SkillPreset";

// 文字列が MagicId か判定
export function isMagicId(skill: SkillItem): skill is SkillItem {
    return Object.values(MagicId).includes(skill.skillId as MagicId);
}

export function isTechnickId(skill: SkillItem): skill is SkillItem {
    return Object.values(TechniqueId).includes(skill.skillId as TechniqueId);
}