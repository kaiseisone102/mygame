// src/renderer/game/battle/event/BattleEvent.ts

export type BattleEvent =
    | {
        type: typeof BattleEventKind.BULK; // 新設
        events: BattleEvent[];            // 同時に実行したいイベントの配列
    }
    | {
        type: typeof BattleEventKind.DAMAGE;
        instanceId: number;
        targetId: number;
        value: number;
        options: { isCritical: boolean, isWeakness: boolean, isResist: boolean, sizeMultiplier: number }
        killed: boolean;
        success?: boolean; // ミス用
    }
    | {
        type: typeof BattleEventKind.HEAL;
        instanceId: number;
        targetId: number;
        value: number;
        success?: boolean; // ミス用
    }
    | {
        type: typeof BattleEventKind.DEAD;
        targetId: number;
    }
    | {
        type: typeof BattleEventKind.STATUS_APPLIED;
        instanceId: number;
        targetId: number;
        statusId: string;
        success?: boolean; // ミス用
    }
    | {
        type: typeof BattleEventKind.BUFF_APPLIED;
        instanceId: number;
        targetId: number;
        buffId: string;
        value: number;
        success?: boolean; // ミス用
    } | {
        type: typeof BattleEventKind.ESCAPE;
        instanceId: number;
    }
    | {
        type: typeof BattleEventKind.DELAY;
        duration: number;
    };

export const BattleEventKind = {
    BULK: "BULK", DAMAGE: "DAMAGE", HEAL: "HEAL", DEAD: "DEAD",
    STATUS_APPLIED: "STATUS_APPLIED", BUFF_APPLIED: "BUFF_APPLIED", ESCAPE: "ESCAPE", DELAY: "DELAY"
} as const;
export type BattleEventKind = typeof BattleEventKind[keyof typeof BattleEventKind]