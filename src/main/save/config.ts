// src/main/save/config.ts
import { app } from "electron";
import * as fs from "fs";
import * as path from "path";
import { GameConfig, defaultGameConfig, } from "../../shared/config/GameConfig";
import { sanitizeData } from "../../shared/utils/Sanitizer";
const configPath = path.join(
    app.getPath("userData"),
    "config.json"
);

export function loadConfig(): GameConfig {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(
            configPath,
            JSON.stringify(defaultGameConfig, null, 2)
        );
        return defaultGameConfig;
    }
    try {
        const raw = fs.readFileSync(configPath, "utf-8");
        return { ...defaultGameConfig, ...JSON.parse(raw) };
    } catch {
        return defaultGameConfig;
    }
}

export function saveConfig(config: GameConfig) {
    const cleanConfig = sanitizeData(config);

    fs.writeFileSync(
        configPath,
        JSON.stringify(cleanConfig, null, 2)
    );
}
