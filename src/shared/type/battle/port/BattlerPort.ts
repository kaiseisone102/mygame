// src/shared/type/battle/port/BattlerPort.ts
export interface BattlerPort {
    id: number;
    baseStats: {
        hp: number;
        maxHp: number;
        mp: number;
    }
    alive: boolean;

    addHp(amount: number): void;
    addMp(amount: number): void;
}
