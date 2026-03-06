// src/renderer/types/global.d.ts

export {};

declare global {
    interface Window {
        saveGameAPI: {
            loadGameFile(slot: number): Promise<any>;
            saveGameFile(slot: number, data: any): Promise<void>;
        };
        configAPI: {
            loadConfig(): Promise<{ masterVolume: number, bgmVolume: number, seVolume: number }>;
            saveConfig(config: { masterVolume: number, bgmVolume: number, seVolume: number }): Promise<void>;
        }
    }
}
