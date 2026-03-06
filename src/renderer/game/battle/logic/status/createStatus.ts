// src/renderer/game/battle/logic/status/createStatus.ts

import { StatusPresets } from "../../../../../shared/master/battle/StatusPreset";
import { StatusSource } from "../../../../../shared/type/battle/status/context/StatusSource";
import { StackRuleId } from "../../../../../shared/type/battle/status/StackRule";
import { StatusEffect } from "../../../../../shared/type/battle/status/StatusEffect";

const DEFAULT_STATUS: Pick<StatusEffect, "priority" | "duration" | "stackRule"> = {
    priority: 0,
    duration: -1,
    stackRule: StackRuleId.IGNORE,
};

export function createStatus(id: keyof typeof StatusPresets, context?: StatusSource): StatusEffect {
    return {
        ...DEFAULT_STATUS,   // システム保証
        ...StatusPresets[id],  // 調整用
        context,
    };
}
