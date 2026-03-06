import { SaveManager } from "../../../../../renderer/save/saveManager";

// src/renderer/screens/router/useCase/SaveGameUseCase.ts
export class SaveGameUseCase {
    constructor(private saveManager: SaveManager) {}

    execute() {
        this.saveManager.saveCurrent();
    }
}
