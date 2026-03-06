// src/renderer/input/keyboard/axis/AxisRepeater.ts

import { InputAxis } from "../../mapping/InputMapper";

type AxisCallback = (axis: InputAxis) => void;
type AxisState = {
    holding: boolean;
    elapsed: number;
    total: number;
};
type AxisRepeaterConfig = {
    initialDelay: number;
    repeatInterval: number;
};
export class AxisRepeater {
    private state: Partial<Record<InputAxis, AxisState>> = {};

    constructor(
        private onFire: AxisCallback,
        private config: AxisRepeaterConfig
    ) { }
    // 押下開始 / 解放終了
    onAxis(axis: InputAxis, pressed: boolean) {
        console.log("[UIAxisRepeater] onAxis", axis, pressed);

        const exists = this.state[axis];

        if (pressed) {
            if (exists) {
                console.log("[UIAxisRepeater] already holding", axis);
                return;
            }

            this.state[axis] = {
                holding: true,
                elapsed: 0,
                total: 0,
            };

            console.log("[UIAxisRepeater] fire immediately", axis);

            // 初回は即反応
            this.onFire(axis);
        } else {
            console.log("[UIAxisRepeater] release", axis);
            delete this.state[axis];
        }
    }
    // 時間管理と連打発火の唯一の場所
    update(delta: number) {
        for (const axis in this.state) {
            const s = this.state[axis as InputAxis]!;
            console.log(
                "[UIAxisRepeater] update",
                axis,
                "total:", s.total.toFixed(2),
                "elapsed:", s.elapsed.toFixed(2)
            );
            if (!s.holding) continue;

            s.total += delta;

            // 初回ディレイ
            if (s.total < this.config.initialDelay) {
                s.elapsed = 0;
                continue;
            }

            s.elapsed += delta;
            const interval = this.config.repeatInterval

            if (s.elapsed >= interval) {
                s.elapsed -= interval;
                this.onFire(axis as InputAxis);
            }
        }
    }
    // 状態を完全リセット（画面切り替え用）
    reset() {
        this.state = {}
    }
}