// src/renderer/usecase/screen/ChangeMainScreenUseCase.ts

import { MainScreenType } from "../../../../../shared/type/screenType";
import { BgmUseCase } from "../audio/BgmUseCase";
import { ScreenPort } from "../../../../../renderer/port/ScreenPort";
import { MapId } from "../../../../../shared/type/MapId";

/**
 * 役割
 * 画面を切り替える
 * 音楽を変える
 */
export class ChangeMainScreenUseCase {
    constructor(
        private screens: ScreenPort,
        private bgmUseCase: BgmUseCase,
    ) { }

    execute(type: MainScreenType) {
        // ワールド系スクリーンなら初期化
        const mapId = this.resolveMapId(type);
        console.log("[ChangeMainScreenUseCase] mapId :", mapId)

        this.bgmUseCase.onMainScreenChanged(type);
        this.screens.changeMain(type);
    }

    private resolveMapId(type: MainScreenType): MapId | null {
        switch (type) {
            case MainScreenType.FOREST_TEMPLE:
                return MapId.FOREST_TEMPLE;
            case MainScreenType.WORLD_MAP:
                return MapId.WORLD_MAP;
            case MainScreenType.GRAVE_CAVE:
                return MapId.GRAVE_CAVE;
            case MainScreenType.NO_FEATURE_TOWN:
                return MapId.NO_FEATURE_TOWN;
            default:
                return null;
        }
    }
}
