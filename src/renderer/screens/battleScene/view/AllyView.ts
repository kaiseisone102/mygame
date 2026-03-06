// src/renderer/screens/battleScene/view/AllyView.ts

export class AllyView {
    readonly element: HTMLElement;

    constructor(allyId: number, name: string, root: HTMLElement) {
        this.element = document.createElement("div");
        this.element.className = "ally";
        this.element.dataset.allyId = String(allyId);
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