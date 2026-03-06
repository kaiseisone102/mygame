// src/shared/type/PlayerAbilities.ts

export const AbilityKey = {
    SWIM: "swim", FIRE_RESIST: "fireResist", POISON: "poison"
} as const;
export type AbilityKey = typeof AbilityKey[keyof typeof AbilityKey];

export type PlayerAbilities = { [K in AbilityKey]?: boolean };
