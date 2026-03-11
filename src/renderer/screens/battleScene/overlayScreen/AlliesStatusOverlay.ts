// src/renderer/screens/battleScene/overlayScreen/AlliesStatusOverlay.ts

import { Battler } from "../../../../renderer/game/battle/core/Battler";
import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../renderer/router/WorldEvent";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";

export interface AlliesStatusPayload {
    allies: Battler[];
}

export class AlliesStatusOverlay implements OverlayScreen<AlliesStatusPayload> {
    readonly overlayId: string = OverlayScreenType.ALLIES_STATUS_OVERLAY;

    readonly capturesInput: boolean = false;

    private screen!: HTMLElement;
    private emitWorld!: (event: WorldEvent) => void;
    private emitUI!: (event: AppUIEvent) => void;
    private ctx!: ScreenInitContext;

    /** battler id をキーにした DOM 参照 */
    private allyElements: Map<number, { hpEl: HTMLElement; mpEl: HTMLElement, hpTextEl: HTMLElement, mpTextEl: HTMLElement }> = new Map();

    /** 表示中の味方リスト */
    private allies: Battler[] = [];

    constructor() { }

    /** 初期化 */
    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.ctx = initCtx;
        this.emitWorld = this.ctx.emitWorld;
        this.emitUI = this.ctx.emitUI;

        this.screen = document.createElement("div");
        this.screen.id = "allies-status-overlay";
        root.appendChild(this.screen);

        this.hide();
    }

    /** 表示 */
    show(payload: AlliesStatusPayload) {
        this.screen.innerHTML = ""; // 前回の内容をクリア
        this.screen.style.display = "block";
        this.allies = payload.allies;

        payload.allies.forEach(ally => {
            const container = document.createElement("div");
            container.className = "ally-status";

            const nameEl = document.createElement("div");
            nameEl.textContent = ally.name;
            nameEl.className = "ally-name";

            // HPバー
            const hpContainer = document.createElement("div");
            hpContainer.className = "ally-hp-container";

            const hpBar = document.createElement("div");
            hpBar.className = "ally-hp-bar";
            hpBar.style.width = `${(ally.baseStats.hp / ally.baseStats.maxHp) * 100}%`;

            const hpText = document.createElement("div");
            hpText.className = "ally-hp-text";
            hpText.textContent = `${ally.baseStats.hp} / ${ally.baseStats.maxHp}`;

            hpContainer.appendChild(hpBar);
            hpContainer.appendChild(hpText);

            // MPバー
            const mpContainer = document.createElement("div");
            mpContainer.className = "ally-mp-container";

            const mpBar = document.createElement("div");
            mpBar.className = "ally-mp-bar";
            mpBar.style.width = `${(ally.baseStats.mp / ally.baseStats.maxMp) * 100}%`;

            const mpText = document.createElement("div");
            mpText.className = "ally-mp-text";
            mpText.textContent = `${ally.baseStats.mp} / ${ally.baseStats.maxMp}`;

            mpContainer.appendChild(mpBar);
            mpContainer.appendChild(mpText);

            container.appendChild(nameEl);
            container.appendChild(hpContainer);
            container.appendChild(mpContainer);

            this.screen.appendChild(container);

            // DOM参照を保存して更新用に
            this.allyElements.set(ally.instanceId, { hpEl: hpBar, mpEl: mpBar, hpTextEl: hpText, mpTextEl: mpText });
        });
    }

    /** 非表示 */
    hide() {
        this.screen.style.display = "none";
    }

    update(delta: number) {
        // 生存している味方の HP/MP を DOM に反映
        this.allies.forEach(ally => {
            const el = this.allyElements.get(ally.instanceId);
            if (!el) return;

            const hpRatio = ally.baseStats.hp / ally.baseStats.maxHp;
            const mpRatio = ally.baseStats.mp / ally.baseStats.maxMp;

            // バーの幅だけ変更
            el.hpEl.style.width = `${hpRatio * 100}%`;
            el.mpEl.style.width = `${mpRatio * 100}%`;

            // テキストは別要素に表示
            el.hpTextEl.textContent = `${ally.baseStats.hp} / ${ally.baseStats.maxHp}`;
            el.mpTextEl.textContent = `${ally.baseStats.mp} / ${ally.baseStats.maxMp}`;
        });
    }

    pause() { }
    resume() { }

    handleUIActions(actions: UIActionEvent[]): boolean {
        return true;
    }
    handleUIAxes(axes: InputAxis[]): boolean {
        return true;
    }
}