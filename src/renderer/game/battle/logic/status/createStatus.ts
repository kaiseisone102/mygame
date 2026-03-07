// src/renderer/game/battle/logic/status/createStatus.ts

import { StatusInstance } from "../../../../../shared/type/battle/status/StatusInstance";
import { StatusPresets } from "../../../../../shared/master/battle/StatusPreset";
import { StatusSource } from "../../../../../shared/type/battle/status/context/StatusSource";
import { StatusId } from "../../../../../shared/type/battle/status/StatusEffect";

export function createStatus(statusId: StatusId, context: StatusSource): StatusInstance {

    const base = StatusPresets[statusId];

    return {
        ...base,
        instanceId: crypto.randomUUID(),
        duration: base.duration ?? 1,
        source: context.source,
        skill: context.skill,
    };
}
