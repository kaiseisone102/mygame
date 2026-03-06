// srv/renderer/assets/AssetsContext.ts

import { FrameSet, StandSet } from "../../renderer/game/player/PlayerAssets";

export type PlayerAssets = {
    frames: FrameSet;
    stand: StandSet;
};

export type AssetsContext = {
    player: PlayerAssets;
};