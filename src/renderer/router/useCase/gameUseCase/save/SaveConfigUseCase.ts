import { GameConfig } from "../../../../../shared/config/GameConfig";

export class SaveConfigUseCase {
    execute = async (config: GameConfig) => {
        await window.configAPI.saveConfig(config);
    }
}
