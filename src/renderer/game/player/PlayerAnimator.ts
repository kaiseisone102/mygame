// src/renderer/game/player/PlayerAnimator.ts

import { AppDirection, PlayerMotionType, PlayerState } from "../../../shared/type/PlayerState";

type FrameSet = Record<AppDirection, HTMLImageElement[]>;

export class PlayerAnimator {
    private frameIndex = 0;
    private elapsed = 0;
    private currentDir: AppDirection = AppDirection.DOWN;

    constructor(
        private imgFrames: FrameSet,
        private stand: Record<AppDirection, HTMLImageElement>,
        private interval = 400
    ) {}

    update(state: PlayerState, delta: number): HTMLImageElement {
        if (state.direction !== this.currentDir) {
            this.currentDir = state.direction;
            this.frameIndex = 0;
            this.elapsed = 0;
        }

        if (state.type === PlayerMotionType.WALK) {
            this.elapsed += delta;
            if (this.elapsed >= this.interval) {
                this.elapsed = 0;
                this.frameIndex =
                    (this.frameIndex + 1) %
                    this.imgFrames[this.currentDir].length;
            }
            return this.imgFrames[this.currentDir][this.frameIndex];
        }

        return this.stand[this.currentDir];
    }
}
