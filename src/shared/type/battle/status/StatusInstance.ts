// src/shared/type/battle/status/StatusInstance.ts

import { StatusPreset } from "../../../master/battle/StatusPreset";
import { BattlerPort } from "../port/BattlerPort";
import { SkillPort } from "../port/skillPort";
import { StatusEffect } from "./StatusEffect";

export type StatusInstance = StatusPreset & StatusEffect & {
    instanceId: string,
    duration: number,
    source: BattlerPort,
    skill: SkillPort,
}