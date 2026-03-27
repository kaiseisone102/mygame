// src/renderer/view/EncounterTransition.ts

export class EncounterTransition {
    private static container: HTMLElement | null = null;
    private static isAnimating = false; // 二重実行防止

    // CSSで定義するアニメーション時間 (ms)
    private static readonly FLASH_IN_DURATION = 500; // 白・赤が迫る時間
    private static readonly FLASH_OUT_DURATION = 500; // ガラスが砕け散る時間

    // アウトラインの太さを調整する定数 (0.1 〜 1.0 程度で調整)
    private static readonly OUTLINE_THICKNESS = 0.1;

    private static readonly MAIN_LAYER_COLOR = "white";
    private static readonly OUTLINE_LAYER_COLOR = "green";

    // 分割数（ここを増やすとより細かく砕けます）
    private static readonly COLS = 5;
    private static readonly ROWS = 3;

    /** 頂点情報を保持するマップ（隙間をなくすために共有する） */
    private static vertexMap: { x: number, y: number }[][] = [];

    private static getElement(): HTMLElement {
        if (this.container) return this.container;

        // メインコンテナ
        this.container = document.createElement("div");
        this.container.id = "encounter-transition";

        this.container.style.setProperty('--main-color', this.MAIN_LAYER_COLOR);
        this.container.style.setProperty('--outline-color', this.OUTLINE_LAYER_COLOR);

        // レイヤー1: ホワイト（ガラスのメイン部分）
        const layerMain = document.createElement("div");
        layerMain.className = "shards-layer shards-layer-main";

        // レイヤー2: レッド（強調・アウトライン部分）
        const layerOutLine = document.createElement("div");
        layerOutLine.className = "shards-layer shards-layer-outline";

        // 1. 頂点マップの生成（ランダムな歪みを持つ格子）
        this.generateVertexMap();

        // 2. 破片の生成（三角形に分割してより鋭利にする）
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                // 1つの四角い領域を2つの三角形の破片(A, B)に分割して「鋭さ」を出す
                this.createShard(r, c, 'A', this.MAIN_LAYER_COLOR, layerMain);
                this.createShard(r, c, 'B', this.MAIN_LAYER_COLOR, layerMain);
                this.createShard(r, c, 'A', this.OUTLINE_LAYER_COLOR, layerOutLine);
                this.createShard(r, c, 'B', this.OUTLINE_LAYER_COLOR, layerOutLine);
            }
        }

        this.container.appendChild(layerOutLine);
        this.container.appendChild(layerMain);
        document.body.appendChild(this.container);
        return this.container;
    }

    /** 画面全体の歪んだ頂点網を生成 */
    private static generateVertexMap() {
        this.vertexMap = [];
        const jitter = 8; // 歪みの強さ（単位 %）

        for (let r = 0; r <= this.ROWS; r++) {
            this.vertexMap[r] = [];
            for (let c = 0; c <= this.COLS; c++) {
                let x = (c / this.COLS) * 100;
                let y = (r / this.ROWS) * 100;

                // 端以外の頂点をランダムにずらす
                if (c > 0 && c < this.COLS) x += (Math.random() - 0.5) * jitter;
                if (r > 0 && r < this.ROWS) y += (Math.random() - 0.5) * jitter;

                this.vertexMap[r][c] = { x, y };
            }
        }
    }

    private static createShard(row: number, col: number, type: 'A' | 'B', layer: typeof EncounterTransition.OUTLINE_LAYER_COLOR | typeof EncounterTransition.MAIN_LAYER_COLOR, parent: HTMLElement) {
        const shard = document.createElement("div");
        shard.className = `shard shard-${layer}-${row}-${col}-${type}`;

        const v = this.vertexMap;
        let points: { x: number, y: number }[] = [];

        // 三角形に分割（A: 左上・右上・左下 / B: 右上・右下・左下）
        if (type === 'A') {
            points = [v[row][col], v[row][col + 1], v[row + 1][col]];
        } else {
            points = [v[row][col + 1], v[row + 1][col + 1], v[row + 1][col]];
        }

        // メインレイヤーだけ少し内側に絞る（赤の縁取りを見せるため）
        const shrink = layer === EncounterTransition.MAIN_LAYER_COLOR
            ? this.OUTLINE_THICKNESS + Math.random() * 0.1
            : 0;

        const centerX = (points[0].x + points[1].x + points[2].x) / 3;
        const centerY = (points[0].y + points[1].y + points[2].y) / 3;

        const clipPath = `polygon(${points.map(p => {
            const px = p.x + (centerX - p.x) * shrink;
            const py = p.y + (centerY - p.y) * shrink;
            return `${px}% ${py}%`;
        }).join(', ')})`;

        // Shatter用の物理パラメータ
        const moveDist = 150 + Math.random() * 100; // 飛び散る距離
        const angle = Math.atan2(centerY - 50, centerX - 50) + (Math.random() - 0.5) * 0.5;

        shard.style.setProperty('--shard-clip-path', clipPath);
        shard.style.setProperty('--shard-move-x', `${Math.cos(angle) * moveDist}%`);
        shard.style.setProperty('--shard-move-y', `${Math.sin(angle) * moveDist}%`);
        shard.style.setProperty('--shard-rotate', `${(Math.random() - 0.5) * 720}deg`);
        shard.style.setProperty('--shard-delay', `${Math.random() * 0.3}s`);

        parent.appendChild(shard);
    }

    static async flashIn(): Promise<void> {
        if (this.isAnimating) return;
        this.isAnimating = true;
        const el = this.getElement();
        el.classList.remove("encounter-active", "encounter-shatter");
        void el.offsetWidth; // reflow
        el.classList.add("encounter-active");
        await new Promise(resolve => setTimeout(resolve, this.FLASH_IN_DURATION));
    }

    static async flashOut(): Promise<void> {
        if (!this.isAnimating) return;
        const el = this.getElement();
        el.classList.add("encounter-shatter");
        await new Promise(resolve => setTimeout(resolve, this.FLASH_OUT_DURATION));
        el.classList.remove("encounter-active", "encounter-shatter");
        this.isAnimating = false;
    }
}