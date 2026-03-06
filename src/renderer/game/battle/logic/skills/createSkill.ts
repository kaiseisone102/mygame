// renderer/game/battle/logic/skills/createSkill.ts

import { SkillPresets } from "../../../../../shared/master/battle/SkillPresets";

export function createSkill(id: keyof typeof SkillPresets) {
  return {
    ...SkillPresets[id],
  };
}
