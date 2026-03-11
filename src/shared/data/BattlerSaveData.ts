// src/renderer/game/battle/core/Battler.ts

import { Buff } from "../../renderer/game/battle/logic/status/effects/buff";
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
    skills: SkillId[];             // SkillId[]
    buffs: Buff[];
    statusEffects: StatusInstance[];
};