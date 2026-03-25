// src/renderer/game/battle/core/Battler.ts

import { StatusInstance } from "../master/battle/StatusPreset";
import { TraitId } from "../master/battle/TraitPresets";
import { AiType } from "../master/battle/type/EnemyPreset ";
import { SkillId } from "../master/battle/type/SkillPreset";
import { BaseStats } from "./playerConstants";

export type BattlerSaveData = {
    actorMasterId: number;
    instanceId: number;
    name: string;
    level: number;
    exp: number;
    baseStats: BaseStats;
    skillIds: SkillId[];
    traits: TraitId[];
    statusEffects: StatusInstance[];
    aiType: AiType;
};