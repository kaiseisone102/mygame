// src/renderer/input/axis/AxisEvent.ts
import { InputAxis } from "../../mapping/InputMapper";

export interface AxisEvent {
    axis: InputAxis;
    pressed: boolean;
    timestamp: number;        // 押下/解放時刻
    target: "UI" | "GAME" | "BOTH"; // 用途別フラグ
}
