// src/renderer/usecase/audio/BgmUseCase.ts
import { audioManager } from "../../../../../renderer/asset/audio/audioManager";
import { MainScreenType } from "../../../../../shared/type/screenType";

export class BgmUseCase {
    onMainScreenChanged(type: MainScreenType) {
        switch (type) {
            case MainScreenType.TITLE:
            case MainScreenType.SLOT_SELECT:
                audioManager.playBGM(
                    "assets/bgm/rabbitsCafeteria.mp3",
                    0.4,
                    800
                );
                break;

            case MainScreenType.FOREST_TEMPLE:
            case MainScreenType.WORLD_MAP:
                audioManager.playBGM(
                    "assets/bgm/rabbitsCafeteria.mp3",
                    0.4,
                    600,
                    true
                );
                break;
        }
    }

    stop() {
        audioManager.stopBGM(500);
    }
}
    