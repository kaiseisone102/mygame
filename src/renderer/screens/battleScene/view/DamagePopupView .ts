// src/renderer/screens/battleScene/view/DamagePopupView.ts

import { BattleEventKind } from "@/renderer/game/battle/event/BattleEvent";

export class DamagePopupView {
    private el: HTMLElement;

    constructor(
        root: HTMLElement,
        x: number,
        y: number,
        value: number,
        isCritical = false,
        kind: typeof BattleEventKind.DAMAGE | typeof BattleEventKind.HEAL = BattleEventKind.DAMAGE
    ) {
        this.el = document.createElement("div");
        this.el.className = "damagePopup";
        this.el.classList.add(kind);

        if (isCritical) this.el.classList.add("critical");

        this.el.textContent = String(value);

        this.el.style.left = `${x}px`;
        this.el.style.top = `${y}px`;

        root.appendChild(this.el);

        requestAnimationFrame(() => {
            this.el.classList.add("show");
        });

        // 自動で消す
        setTimeout(() => this.el.remove(), 800);
    }
}
