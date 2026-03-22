import { GameConfig } from "../../../../../shared/config/GameConfig";

export class SaveConfigUseCase {
    execute = async (config: GameConfig) => {
        console.log("保存しようとしているデータ:", config);
        await window.configAPI.saveConfig(config);
        console.log("Config Saved!");
    }
}
