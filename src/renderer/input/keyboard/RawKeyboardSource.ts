// src/renderer/input/keyboard/RawKeyboardSource.ts

/**
 * RawKeyHandler
 *
 * @param code    KeyboardEvent.code（物理キー）
 * @param pressed true = keydown / false = keyup
 */
type RawKeyHandler = (code: string, pressed: boolean) => void;

/**
 * RawKeyboardSource
 *
 * 【役割】
 * - ブラウザの KeyboardEvent を最下層で受け取る
 * - ゲーム / UI / フレーム概念に一切依存しない
 *
 * 【保証すること】
 * - keydown / keyup を「押された / 離された」という事実に変換する
 * - OS / ブラウザ依存の key repeat は必ず排除する
 *
 * 【保証しないこと】
 * - 押下状態の保持
 * - フレーム単位の入力
 * - アクション / 軸 / UI への変換
 *
 * ※ このクラスは完全に Stateless
 */
export class RawKeyboardSource {
    private handlers = new Set<RawKeyHandler>();
    private disposed = false;

    constructor() {
        console.log("[RawKeyboard] initialized");
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }

    /**
     * Raw 入力イベントの購読
     * - 登録順は保証されない
     */
    on(handler: RawKeyHandler) {
        this.handlers.add(handler);
    }

    /**
    * 後始末
    *
    * - window からイベントリスナーを解除
    * - 登録済みハンドラを全破棄
    *
    * ※ dispose 後に emit は発生しない
    */
    dispose() {
        if (this.disposed) return;
        this.disposed = true;

        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
        this.handlers.clear();

        console.log("[RawKeyboard] disposed");
    }

    /**
     * 登録された全ハンドラへ Raw 入力を通知
     */
    private emit(code: string, pressed: boolean) {
        if (this.disposed) return;

        // console.log(
        //     "[★RawKeyboard] emit",
        //     `{ code: ${code}, pressed: ${pressed}, handlers: ${this.handlers.size} }`
        // );
        for (const h of this.handlers) {
            h(code, pressed)
        };
    }

    /**
     * keydown
     * - e.repeat は必ず無視する（連打制御は上位責務）
     */
    private onKeyDown = (e: KeyboardEvent) => {
        // OSリピートは禁止（ゲーム側で制御する）
        if (e.repeat) { // ← UI/GAME両方で repeat は禁止
            //console.log("[RawKeyboard] repeat ignored:", e.code);
            return
        }

        this.emit(e.code, true);
    };

    /**
     * keyup
     */
    private onKeyUp = (e: KeyboardEvent) => {
        this.emit(e.code, false);
    };
}
