// src/renderer/screens/battleScene/view/DamagePopupView.ts

import { BattleEventKind } from "../../../../renderer/game/battle/event/BattleEvent";

export class DamagePopupView {
    private container: HTMLElement; // すべての演出パーツを包む親

    private readonly LIFETIME = 30000; // css の main-sequence で寿命をいじろう

    constructor(
        root: HTMLElement,
        x: number,
        y: number,
        value: number | string,
        options: {
            isCritical?: boolean,
            isWeakness?: boolean,
            isResist?: boolean,
            kind?: typeof BattleEventKind.DAMAGE | typeof BattleEventKind.HEAL,
            sizeMultiplier?: number
        } = {}
    ) {
        const { isCritical = false, isWeakness = false, kind = BattleEventKind.DAMAGE, sizeMultiplier = 1 } = options;

        // 1. 全演出を管理するコンテナの作成（ここを root に追加する）
        this.container = document.createElement("div");
        this.container.className = "p5-damage-view-container";
        this.container.style.position = "absolute";
        this.container.style.left = `${x}px`;
        this.container.style.top = `${y}px`;
        this.container.style.pointerEvents = "none";
        this.container.style.zIndex = isCritical ? "2000" : "1000";

        // 2. メインのダメージ数字要素の作成
        const mainEl = this.createMainElement(value, kind, sizeMultiplier, isCritical, options.isResist);
        this.container.appendChild(mainEl);

        // 3. WEAKNESS演出の追加（既存ロジックそのまま）
        if (isWeakness) {
            const weaknessEl = this.createWeaknessLabel();
            this.container.appendChild(weaknessEl);

            requestAnimationFrame(() => weaknessEl.classList.add("animate"));
        }

        // 4. RESIST演出の追加（既存ロジックそのまま）
        if (options.isResist) {
            const resistEl = this.createResistLabel();
            this.container.appendChild(resistEl);

            requestAnimationFrame(() => resistEl.classList.add("animate"));
        }

        // rootへ追加
        root.appendChild(this.container);

        // 6. アニメーション開始（メイン要素）
        requestAnimationFrame(() => {
            mainEl.classList.add("animate");
        });

        // 7. 【一括管理】寿命が来たらコンテナごと削除
        setTimeout(() => {
            if (this.container.parentNode) {
                this.container.remove();
            }
        }, this.LIFETIME);
    }

    /**
     * メインの数字と背景、各文字の生成
     */
    private createMainElement(value: number | string, kind: string, size: number, isCritical: boolean, isResist?: boolean): HTMLElement {
        const el = document.createElement("div");
        el.className = `damage-popup ${kind}`;

        const rotation = (Math.random() - 0.5) * 20;
        el.style.setProperty('--rotation', `${rotation}deg`);
        el.style.transform = `scale(${size}) rotate(${rotation}deg) skewX(-20deg)`;

        // 背景
        const bgEl = document.createElement("div");
        bgEl.className = "p5-damage-bg";
        el.appendChild(bgEl);

        if (isCritical) {
            el.classList.add("critical");
            this.container.classList.add("critical-hit");
            bgEl.classList.add("critical");
        }

        // 数字/テキスト
        let text = String(value);
        if (kind === BattleEventKind.HEAL && !text.startsWith('+')) text = "+" + text;

        text.split("").forEach((char, i) => {
            const span = document.createElement("span");
            span.textContent = char;
            if (kind === BattleEventKind.HEAL) {
                span.className = "p5-char-heal";
            } else if (isCritical) {
                span.className = "p5-char-critical";
            } else {
                span.className = "p5-char";
            }

            const charRot = (Math.random() - 0.5) * 25;
            const offX = (Math.random() - 0.5) * 80;
            const offY = (Math.random() - 0.5) * 60;

            span.style.display = "inline-block";
            span.style.transform = `rotate(${charRot}deg) translate(${offX}px, ${offY}px) translateZ(50px)`;
            span.style.animationDelay = `${i * 0.04}s`;
            el.appendChild(span);
        });

        return el;
    }

    /**
     * WEAKNESSラベル生成ロジックの分離
     */
    private createWeaknessLabel(): HTMLElement {
        const weaknessEl = document.createElement("div");
        weaknessEl.className = "p5-weakness-label";

        // 座標計算（コンテナ基準の相対座標へ）
        const wJitterX = (Math.random() - 0.5) * 60 + 50;
        const wJitterY = (Math.random() - 0.5) * 30 - 100;
        weaknessEl.style.position = "absolute";
        weaknessEl.style.left = `${wJitterX}px`;
        weaknessEl.style.top = `${wJitterY}px`;
        weaknessEl.style.transform = `rotate(15deg) skewX(-25deg) scale(0)`;

        "WEAKNESS!!".split("").forEach((char, i) => {
            const span = document.createElement("span");
            span.textContent = char;
            span.className = "p5-char";
            const charRot = (Math.random() - 0.5) * 40;
            const charY = (Math.random() - 0.5) * 15;
            span.style.display = "inline-block";
            span.style.transform = `rotate(${charRot}deg) translateY(${charY}px)`;
            span.style.animationDelay = `${0.2 + i * 0.02}s`;
            weaknessEl.appendChild(span);
        });
        return weaknessEl;
    }

    /**
     * RESISTラベル生成ロジックの分離
     */
    private createResistLabel(): HTMLElement {
        const resistEl = document.createElement("div");
        resistEl.className = "p5-resist-label";

        const rJitterX = (Math.random() - 0.5) * 40 - 60;
        const rJitterY = 40;
        resistEl.style.position = "absolute";
        resistEl.style.left = `${rJitterX}px`;
        resistEl.style.top = `${rJitterY}px`;

        "RESIST".split("").forEach((char, i) => {
            const span = document.createElement("span");
            span.textContent = char;
            span.className = "p5-char";
            const charRot = (Math.random() - 0.5) * 10;
            const charY = Math.random() * 5;
            span.style.display = "inline-block";
            span.style.transform = `rotate(${charRot}deg) translateY(${charY}px)`;
            span.style.animationDelay = `${i * 0.05}s`;
            resistEl.appendChild(span);
        });
        return resistEl;
    }
}