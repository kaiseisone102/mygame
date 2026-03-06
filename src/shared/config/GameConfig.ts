// src/shared/config/GameConfig.ts
export interface GameConfig {
    masterVolume: number;
    bgmVolume: number;
    seVolume: number;
}

export const defaultGameConfig: GameConfig = {
    masterVolume: 1.0,
    bgmVolume: 0.4,
    seVolume: 0.8,
};
