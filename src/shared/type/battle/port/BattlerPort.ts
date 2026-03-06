// src/shared/type/battle/port/BattlerPort.ts
export interface BattlerPort {
    id: number;   
    hp: number;
    mp: number;
    maxHp: number;
    alive: boolean;

    addHp(amount: number): void;
    addMp(amount: number): void;
}
