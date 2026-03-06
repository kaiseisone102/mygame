// src/renderer/screens/battleScene/view/EnemyView.ts

export class EnemyView {
    readonly element: HTMLElement;

    constructor(enemyId: number, name: string, root: HTMLElement) {
        this.element = document.createElement("div");
        this.element.className = "enemy";
        this.element.dataset.enemyId = String(enemyId);
        this.element.textContent = name;

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
