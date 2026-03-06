// src/shared/type/battle/status/context/StatusContext.ts

/**
 * Battlerの最小インターフェース
 */
export interface StatusContext {
    hp: number;
    maxHp: number;
    alive: boolean;

    attack?: number;
    defense?: number;
    magic?: number;
    speed?: number;
}