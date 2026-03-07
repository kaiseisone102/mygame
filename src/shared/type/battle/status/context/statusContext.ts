// src/shared/type/battle/status/context/StatusContext.ts

/**
 * Battlerの最小インターフェース
 */
export interface StatusContext {
    baseStats: {
        hp: number;
        maxHp: number;
        attack?: number;
        defense?: number;
        magic?: number;
        speed?: number;
    }
    alive: boolean;
}