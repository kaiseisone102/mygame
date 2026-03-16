// src/renderer/game/battle/core/Battler.ts

import { Buff } from "../../renderer/game/battle/logic/status/effects/buff";
import { TraitId } from "../master/battle/TraitPresets";
import { SkillId } from "../master/battle/type/SkillPreset";
import { StatusInstance } from "../type/battle/status/StatusInstance";
import { BaseStats } from "./playerConstants";

export type BattlerSaveData = {
    templateId: number;
    instanceId: number;
    name: string;
    level: number;
    exp: number;
    baseStats: BaseStats;
    skills: SkillId[];
    traits: TraitId[];
    buffs: Buff[];
    statusEffects: StatusInstance[];
};