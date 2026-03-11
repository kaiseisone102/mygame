// src/renderer/screens/battleScene/view/EnemyView.ts

import { ImageStore } from "../../../../renderer/asset/ImageStore";
import { ImageKey } from "../../../../shared/type/ImageKey";

export class EnemyView {
    readonly element: HTMLElement;
    private img: HTMLImageElement;

    constructor(enemyInstanceId: number, name: string, imageKey: ImageKey | undefined, root: HTMLElement) {
        this.element = document.createElement("div");
        this.element.className = "enemy";
        this.element.dataset.enemyId = String(enemyInstanceId);
        this.element.textContent = name;

        this.img = document.createElement("img");

        if (imageKey) {
            // 毎回新しい <img> DOM が作られる、同種族の複数体に対応
            const original = ImageStore.get(imageKey);
            this.img.src = original.src;
            this.img.alt = name;
        }

        this.element.appendChild(this.img);

        root.appendChild(this.element);
    }

    fadeOut() {
        this.element.classList.add("dead");
    }

    show() {
        this.element.style.display = "block";
    }

    getCenterPosition(): { x: number; y: number } {
        const rect = this.element.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    }
}
