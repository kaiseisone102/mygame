import { ActionManager } from "../action/ActionManager";
import { InputAction } from "../action/InputAction";
import { BaseInputContext } from "../context/BaseInputContext";
import { moveCursorUp } from "./MoveCursorUp";
/**
 * UIContext
 *
 * 役割:
 * - UI / オーバーレイ表示中の入力ルールを定義する Context
 *
 * 特徴:
 * - メイン画面とは異なる Action の意味を持つ
 *   例:
 *   - MoveUp   : キャラ移動 → UIカーソル移動
 *   - Confirm  : 決定
 *   - Cancel   : UIを閉じる
 *
 * - UIContext が有効な間は、下層の Context（メイン画面）は入力を受け取らない
 */
export class UIContext extends BaseInputContext {

    /**
     * UI用入力処理
     *
     * @param am  ActionManager（Action判定の窓口）
     * @param now 現在時刻(ms)
     */
    handleInput(am: ActionManager, now: number): void {

        // カーソルを上へ移動（Repeat対応）
        if (am.isActionTriggered(InputAction.MoveUp, now)) {
            moveCursorUp();
        }

        // 決定
        if (am.isActionTriggered(InputAction.Confirm, now)) {
            confirm();
        }

        // キャンセル / UIを閉じる
        if (am.isActionTriggered(InputAction.Cancel, now)) {
            close();
        }
    }
}
