// src/renderer/input/keyboard/axis/GameAxisSource.ts
import { InputAxis } from "../../mapping/InputMapper";
import { AxisSource } from "./AxisSource";

type AxisHandler = (axis: InputAxis, pressed: boolean) => void;
// 生のキー情報 を処理
export class GameAxisSource implements AxisSource {
    private handlers = new Set<AxisHandler>();

    on(handler: AxisHandler) {
        this.handlers.add(handler);
    }

    emit(axis: InputAxis, pressed: boolean) {
        for (const h of this.handlers) {
            h(axis, pressed);
        }
    }
}
