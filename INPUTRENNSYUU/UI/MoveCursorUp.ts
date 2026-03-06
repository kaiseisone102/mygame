/**
 * UIカーソル管理用の状態
 */
let cursorIndex = 0;
const maxItems = 5;

/**
 * UIカーソルを1つ上に移動する
 */
export function moveCursorUp(): void {
    cursorIndex--;

    // 上限を超えたらループ（好みにより clamp 可）
    if (cursorIndex < 0) {
        cursorIndex = maxItems - 1;
    }

    updateCursorView();
}

/**
 * UIの表示をカーソル位置に合わせて更新する
 */
function updateCursorView(): void {
    // 実際の UI 表示更新処理
    // 例:
    // uiList.setActiveIndex(cursorIndex);
}
