// src/renderer/screens/overlayScreens/TargetSelectOverlay.ts

import { audioManager } from "@/renderer/asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "@/renderer/input/mapping/InputMapper";
import { AppUIEvent } from "@/renderer/router/AppUIEvents";
import { WorldEvent } from "@/renderer/router/WorldEvent";
import { CommandMode } from "@/shared/type/battle/TargetType";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { OverlayScreen } from "../../interface/overlay/OverLayScreens";

type Enemy = {
    id: number;
    name: string;
    alive: boolean;
};

export class TargetSelectOverlay implements OverlayScreen {
    readonly capturesInput: true = true;

    private screen!: HTMLElement;
    private list!: HTMLElement;
    private items: HTMLParagraphElement[] = [];
    private targets: Enemy[] = [];
    private selectedIndex = 0;

    private emitWorld!: (event: WorldEvent) => void;
    private emitUI!: (event: AppUIEvent) => void;

    private ctx!: ScreenInitContext;

    constructor(private mode: CommandMode) { }

    /* =====================
        Init
    ===================== */

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        console.log(`[TargetSelectOverlay] init mode=${this.mode}`);

        this.ctx = initCtx;
        this.emitWorld = this.ctx.emitWorld
        this.emitUI = this.ctx.emitUI;

        this.screen = document.createElement("div");
        this.screen.className = "targetSelectOverlay";

        this.list = document.createElement("div");
        this.list.className = "targetList";
        this.screen.appendChild(this.list);

        root.appendChild(this.screen);

        this.hide();
    }

    show() {
        console.log("[TargetSelectOverlay] show");

        // const enemies = this.ctx.battleState.enemies;
        // this.targets = enemies.filter(e => e.alive);
        // this.selectedIndex = 0;
        // this.render();
        // // 生存してる敵だけ表示
        // this.buildList(enemies.filter(e => e.alive));
        // this.screen.style.display = "block";
    }

    hide() {
        this.screen.style.display = "none";
    }

    update(delta: number): void {

    }

    /* =====================
        Input
    ===================== */

    handleUIAxes(axes: InputAxis[]): boolean {
        for (const axis of axes) {

            switch (axis) {
                case "UP":
                case "LEFT":
                    this.moveCursor(-1);
                    break;

                case "DOWN":
                case "RIGHT":
                    this.moveCursor(1);
                    break;
            }
        }
        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        for (const e of events) {
            switch (e.action) {
                case "CONFIRM":
                    audioManager.playSE("assets/se/decide.mp3");
                    this.confirm();
                    return true;

                case "CANCEL":
                    audioManager.playSE("assets/se/cancel.mp3");
                    this.cancel();
                    return true;
            }
        }
        return true;
    }

    /* =====================
        Internal
    ===================== */

    private buildList(enemies: Enemy[]) {
        this.list.innerHTML = "";
        this.items = [];

        const aliveEnemies = enemies.filter(e => e.alive);

        aliveEnemies.forEach(enemy => {
            const p = document.createElement("p");
            p.textContent = enemy.name;
            p.dataset.enemyId = String(enemy.id);

            this.list.appendChild(p);
            this.items.push(p);
        });

        this.selectedIndex = 0;
        this.updateUI();
    }

    private moveCursor(delta: number) {
        if (this.items.length === 0) return;

        this.selectedIndex =
            (this.selectedIndex + delta + this.items.length) %
            this.items.length;

        this.updateUI();
        audioManager.playSE("assets/se/cursorMove.mp3");
    }

    private updateUI() {
        this.items.forEach((el, i) =>
            el.classList.toggle("selected", i === this.selectedIndex)
        );
    }

    private confirm() {
        const el = this.items[this.selectedIndex];
        const enemyId = Number(el.dataset.enemyId);

        console.log(
            `[TargetSelectOverlay] CONFIRM ${this.mode} target=${enemyId}`
        );

        if (this.mode === "ATTACK") {
            this.emitUI({
                type: "ATTACK_TARGET_SELECTED",
                targetEnemyId: enemyId,
            });
        } else {
            this.emitUI({
                type: "MAGIC_TARGET_SELECTED",
                targetEnemyId: enemyId,
            });
        }
    }

    private cancel() {
        console.log(`[TargetSelectOverlay] CANCEL ${this.mode}`);

        this.emitUI({
            type:
                this.mode === "ATTACK"
                    ? "CLOSE_ATTACK_TARGET"
                    : "CLOSE_MAGIC_TARGET",
        });
    }
}
