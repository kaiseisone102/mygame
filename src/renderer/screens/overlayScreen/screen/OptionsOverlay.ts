// src/renderer/screens/overlayScreens/screen/OptionsOverlay.ts

import { OverlayScreenType } from "../../../../shared/type/screenType";
import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { OverlayScreen } from "../../interface/overlay/OverLayScreens";
import { OptionsOverlayController } from "./controller/OptionsOverlayController";

/**
 * OptionsScreen
 *
 * 役割:
 * - オプション（音量設定）画面の表示と操作
 * - UIAxis によるフォーカス移動・値変更
 * - UIAction による確定 / キャンセル処理
 *
 * 入力仕様:
 * - UP / DOWN    : スライダーフォーカス移動
 * - LEFT / RIGHT : スライダー値変更
 * - CONFIRM      : 設定を保存して閉じる
 * - CANCEL       : 変更を破棄して閉じる
 *
 * 備考:
 * - 設定変更は confirm されるまで GameConfig へ反映されない
 * - 操作中の音量は即時プレビューされる
 */
export class OptionsOverlay implements OverlayScreen {
    readonly overlayId: string = OverlayScreenType.OPTIONS;
    /** この画面が入力をキャプチャするか */
    readonly capturesInput: true = true;

    private controller!: OptionsOverlayController;

    /**
     * 初期化
     */
    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.controller = new OptionsOverlayController();
        this.controller.init(root, initCtx);
        this.hide();
        console.log("[OptionsOverlay] done init")
    }

    /**
     * 表示
     */
    show(): void {
        this.controller.show();
    }

    /**
     * 非表示
     */
    hide(): void {
        this.controller.hide();
    }

    update(delta: number): void {
        this.controller.update(delta);
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        this.controller.UIAxes(axes);
        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        this.controller.UIActions(events)
        return true;
    }
}
