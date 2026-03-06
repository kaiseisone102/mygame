import { MapId } from "../../type/MapId";
import { MainScreenType } from "../../type/screenType";

// MapId → MainScreenType のマップ
export const mapIdToMainScreen: Record<MapId, MainScreenType> = {
    FOREST_TEMPLE: MainScreenType.FOREST_TEMPLE,
    WORLD_MAP: MainScreenType.WORLD_MAP,
    NO_FEATURE_TOWN: MainScreenType.NO_FEATURE_TOWN,
    GRAVE_CAVE: MainScreenType.GRAVE_CAVE,
};
