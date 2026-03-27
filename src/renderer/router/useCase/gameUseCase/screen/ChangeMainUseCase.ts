// src/renderer/usecase/screen/ChangeMainScreenUseCase.ts

import { TransitionView } from "../../../../../renderer/screens/view/TransitionView";
import { ScreenPort } from "../../../../../renderer/port/ScreenPort";
import { MainScreenPayloadMap } from "../../../../../renderer/screens/interface/screen/MainScreenPayloadMap";
import { MapId } from "../../../../../shared/type/MapId";
import { MainScreenType } from "../../../../../shared/type/screenType";
import { BgmUseCase } from "../audio/BgmUseCase";

/**
 * 役割
 * 画面を切り替える
 * 音楽を変える
 */
export class ChangeMainScreenUseCase<K = void> {
    constructor(
        private screens: ScreenPort,
        private bgmUseCase: BgmUseCase,
    ) { }

    async execute<T extends keyof MainScreenPayloadMap>(type: T, payload: MainScreenPayloadMap[T]) {

        this.screens.lockInput(true);

        // ホワイトアウト開始！
        await TransitionView.flashIn();

        // ワールド系スクリーンなら初期化
        const mapId = this.resolveMapId(type);
        console.log(`[ChangeMainScreenUseCase] type: ${type}, mapId: ${mapId}`);

        // BGM切り替え
        this.bgmUseCase.onMainScreenChanged(type);

        // 画面切り替え (ScreenPort の定義と完全に一致する)
        this.screens.changeMain(type, payload);

        // 3. 画面が切り替わった直後に少し待機（ロード時間を稼ぐ）
        await new Promise(r => setTimeout(r, 100));

        // 4. ホワイトアウト解除！
        await TransitionView.flashOut();

        this.screens.lockInput(false);
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
