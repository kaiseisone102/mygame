// src/renderer/view/TransitionView.ts

export class TransitionView {
    private static el: HTMLElement | null = null;
    private static isAnimating = false; // 二重実行防止

    private static getElement(): HTMLElement {
        if (this.el) return this.el;
        this.el = document.createElement("div");
        this.el.id = "transition-container";

        // 背後の黒レイヤー
        const bg = document.createElement("div");
        bg.className = "transition-bg-black";

        // 前面の白レイヤー
        const main = document.createElement("div");
        main.className = "transition-main-white";

        this.el.appendChild(bg);
        this.el.appendChild(main);
        document.body.appendChild(this.el);
        return this.el;
    }

    /** ホワイトアウト（図形が画面を埋め尽くす） */
    static async flashIn(): Promise<void> {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const el = this.getElement();

        // ここで SE を鳴らす（Audio系クラスがあれば呼ぶ）
        // SoundManager.play('shink');

        el.classList.remove("transition-out"); // 前回の残骸を掃除

        void el.offsetHeight;

        el.classList.add("transition-in");

        // アニメーションが終わるまで待機 (CSSの transition 秒数に合わせる)
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    /** ホワイトイン（図形が退場する） */
    static async flashOut(): Promise<void> {
        const el = this.getElement();
        el.classList.remove("transition-in");
        el.classList.add("transition-out");

        await new Promise(resolve => setTimeout(resolve, 500));
        el.classList.remove("transition-out");
        this.isAnimating = false; // ロック解除
    }
}