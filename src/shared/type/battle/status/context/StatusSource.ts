// src/shared/type/battle/status/context/StatusSource.ts

import { BattlerPort } from "../../port/BattlerPort";
import { SkillPort } from "../../port/skillPort";

export type StatusSource = {
    source: BattlerPort;
    skill: SkillPort;
};