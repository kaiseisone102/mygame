// src/shared/master/battle/createStatus.ts

import { StatusId } from "../../type/battle/status/StatusEffect";
import { StatusInstance } from "../../type/battle/status/StatusInstance";
import { StatusSource } from "../../type/battle/status/context/StatusSource";
import { StatusPresets } from "./StatusPreset";

export function createStatus(
    id: StatusId,
    context?: StatusSource
): StatusInstance {

    const preset = StatusPresets[id];

    if (!preset) {
        throw new Error(`Unknown status: ${id}`);
    }

    return {
        ...preset,
        instanceId: crypto.randomUUID(),
        context,
        duration: preset.duration ?? -1,
        priority: preset.priority ?? 0,
        stackRule: preset.stackRule ?? "REPLACE",
    };
}