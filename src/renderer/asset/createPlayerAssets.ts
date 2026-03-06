// src/renderer/assets/createPlayerAssets.ts

import { AppDirection } from "../../shared/type/PlayerState";
import { ImageKey } from "../../shared/type/ImageKey";
import type { PlayerAssets } from "./AssetsContext";

export function createPlayerAssets(
    get: (key: string) => HTMLImageElement
): PlayerAssets {
    return {
        frames: {
            [AppDirection.UP]: [
                get(ImageKey.PLAYER_STAND_LEFT),
                get(ImageKey.PLAYER_STAND_RIGHT),
            ],
            [AppDirection.DOWN]: [
                get(ImageKey.PLAYER_STAND_LEFT),
                get(ImageKey.PLAYER_STAND_RIGHT),
            ],
            [AppDirection.LEFT]: [
                get(ImageKey.PLAYER_LEFT_1),
                get(ImageKey.PLAYER_LEFT_2),
            ],
            [AppDirection.RIGHT]: [
                get(ImageKey.PLAYER_RIGHT_1),
                get(ImageKey.PLAYER_RIGHT_2),
            ],
        },
        stand: {
            [AppDirection.UP]: get(ImageKey.PLAYER_STAND_LEFT),
            [AppDirection.DOWN]: get(ImageKey.PLAYER_STAND_RIGHT),
            [AppDirection.LEFT]: get(ImageKey.PLAYER_LEFT_0),
            [AppDirection.RIGHT]: get(ImageKey.PLAYER_RIGHT_0),
        },
    };
}
