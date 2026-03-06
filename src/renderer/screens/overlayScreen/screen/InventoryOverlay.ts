// src/renderer/screens/overlayScreens/InventoryOverlay.ts

import { OverlayScreenType } from "../../../../shared/type/screenType";
import { InputAxis, UIActionEvent } from "../../../input/mapping/InputMapper";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { OverlayScreen } from "../../interface/overlay/OverLayScreens";
import { InventoryOverlayController } from "./controller/InventoryOverlayController";

/**
 * ItemScreen
 *
 * 役割:
 * - アイテム画面(UIオーバーレイ)を表示する
 * - UIAction / UIAxis を受け取り UI 操作に変換する
 *
 * 入力仕様:
 * - CONFIRM / CANCEL / INVENTORY → 画面を閉じる
 * - 方向キー → UIカーソル操作（想定）
 *
 * 備考:
 * - Game入力は一切扱わない
 * - capturesInput = true により、背後の画面への入力を遮断する
 */
export class InventoryOverlay implements OverlayScreen<string[]> {
    readonly overlayId: string = OverlayScreenType.INVENTORY;

    /** この画面が入力をキャプチャするか */
    readonly capturesInput: true = true;

    private controller!: InventoryOverlayController;

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.controller = new InventoryOverlayController();
        this.controller.init(root, initCtx);
        this.hide();
        console.log("[ItemScreen] done init")
    }

    show(): void {
        this.controller.show();
    }

    hide(): void {
        this.controller.hide();
    }

    update(delta: number): void {
        this.controller.update(delta);
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        this.controller.UIAxis(axes);
        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        this.controller.UIActions(events);
        return true
    }
}
