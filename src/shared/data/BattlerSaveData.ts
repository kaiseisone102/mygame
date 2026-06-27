// src/renderer/game/battle/core/Battler.ts

import { StatusInstance } from "../master/battle/StatusPreset";
import { TraitId } from "../master/battle/TraitPresets";
import { AiType } from "../master/battle/type/EnemyPreset ";
import { SkillId } from "../master/battle/type/SkillPreset";
import { EquipmentMap } from "../type/equipment/EquipSlot";
import { JobId } from "../type/job/JobId";
import { BaseStats } from "./playerConstants";

export type BattlerSaveData = {
    actorMasterId: number;
    instanceId: number;
    name: string;
    level: number;
    exp: number;
    baseStats: BaseStats;
    skillIds: SkillId[];
    traits: TraitId[];          // 個性として持つ特性(装備由来は含めない)
    statusEffects: StatusInstance[];
    aiType: AiType;

    // --- 装備システム ---
    job: JobId;                 // 職(装備の職制限に使用)
    equipment: EquipmentMap;    // 着用中の装備(スロット→装備ID)
};