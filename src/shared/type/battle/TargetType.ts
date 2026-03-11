// src/shared/type/battle/TargetType.ts

export const TargetType = {
    SINGLE_ENEMY: "SINGLE_ENEMY",
    GROUP_ENEMY: "GROUP_ENEMY",
    ALL_ENEMIES: "ALL_ENEMIES",
    SINGLE_ALLY: "SINGLE_ALLY",
    SELF_AND_SINGLE_ALLY: "SELF_AND_SINGLE_ALLY", // 味方をかばう（想定）
    ALL_ALLIES: "ALL_ALLIES",
    SELF: "SELF",
} as const;
export type TargetType = typeof TargetType[keyof typeof TargetType];

export const BattleResult = {
    WIN: "WIN", LOSE: "LOSE", ESCAPE: "ESCAPE", NULL: null,
} as const;
export type BattleResult = typeof BattleResult[keyof typeof BattleResult];

export const CommandMode = {
    ATTACK: "ATTACK", MAGIC: "MAGIC", NULL: null,
} as const;
export type CommandMode = typeof CommandMode[keyof typeof CommandMode];

export const CommandActionType = {
    ATTACK: "ATTACK", MAGIC: "MAGIC", TECHNIQUE: "TECNIQUE", DEFENCE: "DEFENCE", ITEM: "ITEM", ESCAPE: "ESCAPE",
} as const;
export type CommandActionType = typeof CommandActionType[keyof typeof CommandActionType];

