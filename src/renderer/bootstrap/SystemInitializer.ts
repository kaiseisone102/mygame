// src/renderer/bootstrap/SystemInitializer.ts

import { audioManager } from "../asset/audio/audioManager";
import { InputState } from "../input/state/InputState";
import { AxisEventQueue } from "../input/keyboard/axis/AxisEventQueue";
import { InputManager } from "../input/keyboard/InputManager";
import { InputSystem } from "../input/InputSystem";
import { SaveManager } from "../save/saveManager";
import { configRepository, saveGameRepository } from "../save/saveRepository";
import { SaveQueryService } from "../save/query/SaveQueryService";
import { ScreenQueryService } from "../save/query/ScreenQueryService";
import { WorldQueryBus } from "../router/WorldQueryBus";

export class SystemInitializer {
    static init(gameState: any, worldManager: any, screenManager: any, config: any) {
        // 1. オーディオ設定
        audioManager.setMasterVolume(config.masterVolume ?? 0);
        audioManager.setBgmVolume(config.bgmVolume ?? 0);
        audioManager.setSeVolume(config.seVolume ?? 0);

        // 2. インプット系
        const inputState = new InputState();
        const axisQueue = new AxisEventQueue();
        const inputManager = new InputManager(inputState, axisQueue);
        const inputSystem = new InputSystem(inputState, axisQueue, inputManager);

        // 3. セーブ・クエリ系
        const saveManager = new SaveManager(saveGameRepository, configRepository, gameState);
        const screenQuery = new ScreenQueryService(screenManager, worldManager);
        const saveQuery = new SaveQueryService(saveManager);
        const worldQueryBus = new WorldQueryBus(worldManager, screenQuery, saveQuery, configRepository);

        return {
            inputSystem,
            saveManager,
            worldQueryBus,
            saveQuery
        };
    }
}