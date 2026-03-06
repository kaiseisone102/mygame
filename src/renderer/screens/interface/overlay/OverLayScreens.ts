// // src/renderer/screens/interface/overlay/OverlayScreen.ts

import { YesNoEvent } from "../../../../shared/events/ui/YesNoEvent";
import { ScreenInitContext } from "../context/ScreenInitContext";
import { InputAxis, UIActionEvent } from "../../../input/mapping/InputMapper";
import { AttackTargetPayload, BattleEnemy } from "../../battleScene/overlayScreen/AttackTargetOverlay";
import { createOverlayScreens } from "../../overlayScreen/createOverlayScreens";
import { createMainScreens } from "../../mainScreen/createMainScreens";
import { MessageLogEvent } from "../../../../renderer/screens/overlayScreen/screen/MessageLogOverlay";

// 必ず入力を奪う UI レイヤー
export interface OverlayScreen<T = void> {
    readonly overlayId: string;

    init(root: HTMLElement, ctx: ScreenInitContext): void;
    // 初期表示用メソッド
    show(payload: T): void;
    hide(): void;
    handleUIActions(actions: UIActionEvent[]): boolean;
    handleUIAxes(axes: InputAxis[]): boolean;
    // UI は必ず Action で受ける
    // 時間更新専用（入力は禁止）
    update(delta: number): void;
    // アニメ停止メソッド
    pause?(): void;
    // 再表示復帰帰）専用メソッド
    resume?(): void;

    addLog?(message: string): void;
    setEnabled?(enabled: boolean): void;

    // overlay のみで文字入力する
    handleTextInput?(chars: string[]): void;

    setSlotId?(id: number): void;

    // Overlay は基本入力を奪う
    capturesInput: boolean;
    showMessages?(message: string[]): void;

    capturesTextInput?: boolean;
}

export interface YesNoOverlayScreen extends OverlayScreen<YesNoEvent> {

}

export interface AttackTargetOverlayScreen extends OverlayScreen<AttackTargetPayload> {
    setEnemies(enemies: BattleEnemy[]): void;
}

export interface MessageLogOverlayScreen extends OverlayScreen<MessageLogEvent> {

}

export type GetMainScreenType = ReturnType<typeof createMainScreens>;
export type GetOverlayScreenType = ReturnType<typeof createOverlayScreens>;
