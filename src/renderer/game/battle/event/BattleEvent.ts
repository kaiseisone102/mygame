// src/renderer/game/battle/event/BattleEvent.ts

export type BattleEvent =
    | {
        type: typeof BattleEventKind.DAMAGE;
        sourceId: number;
        targetId: number;
        value: number;
        isCritical: boolean;
        killed: boolean;
    }
    | {
        type: typeof BattleEventKind.HEAL;
        sourceId: number;
        targetId: number;
        value: number;
    }
    | {
        type: typeof BattleEventKind.DEAD;
        targetId: number;
    }
    | {
        type: typeof BattleEventKind.STATUS_APPLIED;
        sourceId: number;
        targetId: number;
        statusId: string;
    }
    | {
        type: typeof BattleEventKind.BUFF_APPLIED;
        sourceId: number;
        targetId: number;
        buffId: string;
    };

export const BattleEventKind = {
    DAMAGE: "DAMAGE", HEAL: "HEAL", DEAD: "DEAD",
    STATUS_APPLIED: "STATUS_APPLIED", BUFF_APPLIED: "BUFF_APPLIED"
} as const;
export type BattleEventKind = typeof BattleEventKind[keyof typeof BattleEventKind]