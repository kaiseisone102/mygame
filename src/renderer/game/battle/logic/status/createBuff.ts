// src/renderer/game/battle/logic/status/createBuff.ts

import { BuffPresets } from "../../../../../shared/master/battle/BuffPreset";

export function createBuff(
    id: keyof typeof BuffPresets,
    args: { value: number; turns: number }
) {
    const preset = BuffPresets[id];

    return {
        id: preset.id,
        category: preset.category,
        name: preset.name,
        value: args.value,
        turns: args.turns,
        stackRule: preset.stackRule,
        apply: preset.apply,
    };
}
