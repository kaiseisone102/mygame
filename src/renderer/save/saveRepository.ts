// src/renderer/managers/saveRepository.ts
import { SaveData } from "../../shared/save/SaveData";
import { GameConfig } from "../../shared/config/GameConfig";

export interface SaveGameRepository {
    loadGameFile(id: number): Promise<SaveData | null>;
    saveGameFile(id: number, data: SaveData): Promise<void>;
}

/**
 * SaveGameRepository
 * ------------------
 * セーブデータの永続化インターフェース
 * - 実装は Electron / Web / Mock に差し替え可能
 */
export const saveGameRepository: SaveGameRepository = {
    loadGameFile: async (id) => await window.saveGameAPI.loadGameFile(id),
    saveGameFile: async (id, data) => await window.saveGameAPI.saveGameFile(id, data),
};

export interface ConfigRepository {
    loadConfig(): Promise<GameConfig>;
    saveConfig(config: GameConfig): Promise<void>;
}

export const configRepository: ConfigRepository = {
    async loadConfig() {
        return await window.configAPI.loadConfig();
    },
    async saveConfig(config: GameConfig) {
        await window.configAPI.saveConfig(config);
    },
};
