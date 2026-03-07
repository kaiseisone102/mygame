// src/shared/type/battle/status/StatusInstance.ts

import { StatusPreset } from "../../../master/battle/StatusPreset";
import { BattlerPort } from "../port/BattlerPort";
import { SkillPort } from "../port/skillPort";
import { StatusSource } from "./context/StatusSource";

export type StatusInstance = StatusPreset & {
    instanceId: string,
    duration: number,
    source: BattlerPort,
    skill: SkillPort
}