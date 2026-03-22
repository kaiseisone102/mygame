// src/renderer/screens/battleScene/overlayScreen/AlliesStatusOverlay.ts

import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../renderer/router/WorldEvent";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { ImageStore } from "../../../../renderer/asset/ImageStore";
import { StatusId } from "../../../../shared/master/battle/StatusPreset";
import { ImageKey } from "../../../../shared/type/ImageKey";

export interface AllyStatusData {
    instanceId: number;
    name: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    states: { id: StatusId, duration: number, imageKey: ImageKey }[];
};

export interface AlliesStatusPayload {
    allies: AllyStatusData[];
};

/**
 * AlliesStatusOverlay
 * - 戦闘中の味方 hp, mp を表示
 */
export class AlliesStatusOverlay implements OverlayScreen<AlliesStatusPayload> {
    readonly overlayId: string = OverlayScreenType.ALLIES_STATUS_OVERLAY;

    readonly capturesInput: boolean = false;

    private screen!: HTMLElement;
    private emitWorld!: (event: WorldEvent) => void;
    private emitUI!: (event: AppUIEvent) => void;
    private ctx!: ScreenInitContext;

    /** battler id をキーにした DOM 参照 */
    private allyElements: Map<number, { hpEl: HTMLElement; mpEl: HTMLElement, hpTextEl: HTMLElement, mpTextEl: HTMLElement, statesEl: HTMLElement }> = new Map();

    /** 表示中の味方リスト */
    private allies: AllyStatusData[] = [];

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
            hpBar.style.width = `${(ally.hp / ally.maxHp) * 100}%`;

            const hpText = document.createElement("div");
            hpText.className = "ally-hp-text";
            hpText.textContent = `${ally.hp} / ${ally.maxHp}`;

            hpContainer.appendChild(hpBar);
            hpContainer.appendChild(hpText);

            // MPバー
            const mpContainer = document.createElement("div");
            mpContainer.className = "ally-mp-container";

            const mpBar = document.createElement("div");
            mpBar.className = "ally-mp-bar";
            mpBar.style.width = `${(ally.mp / ally.maxMp) * 100}%`;

            const mpText = document.createElement("div");
            mpText.className = "ally-mp-text";
            mpText.textContent = `${ally.mp} / ${ally.maxMp}`;

            mpContainer.appendChild(mpBar);
            mpContainer.appendChild(mpText);

            // 状態異常コンテナ
            const statesContainer = document.createElement("div");
            statesContainer.className = "ally-states-container";

            container.appendChild(nameEl);
            container.appendChild(hpContainer);
            container.appendChild(mpContainer);
            container.appendChild(statesContainer);

            this.screen.appendChild(container);

            // DOM参照を保存して更新用に
            this.allyElements.set(ally.instanceId, {
                hpEl: hpBar,
                mpEl: mpBar,
                hpTextEl: hpText,
                mpTextEl: mpText,
                statesEl: statesContainer
            });
        });
        this.updateStatus(payload);
    }

    /** 非表示 */
    hide() {
        this.screen.style.display = "none";
    }

    update(delta: number) { }

    pause() { }
    resume() { }

    handleUIActions(actions: UIActionEvent[]): boolean {
        return true;
    }
    handleUIAxes(axes: InputAxis[]): boolean {
        return true;
    }

    updateStatus(payload: AlliesStatusPayload): void {
        // 生存している味方の HP/MP を DOM に反映
        payload.allies.forEach(newAlly => {
            const el = this.allyElements.get(newAlly.instanceId);
            if (!el) return;

            // 前回のHPと比較するために、データを探す
            const oldAlly = this.allies.find(a => a.instanceId === newAlly.instanceId);

            // 1. 完全一致チェック (古いデータが存在し、かつ内容が変わっていない場合のみスキップ)
            if (oldAlly) {
                const isSame = oldAlly.hp === newAlly.hp &&
                    oldAlly.mp === newAlly.mp &&
                    JSON.stringify(oldAlly.states) === JSON.stringify(newAlly.states);
                if (isSame) return;
            }

            // --- 死亡状態の管理 ---
            const statusContainer = el.hpEl.closest(".ally-status");
            if (statusContainer) {
                if (newAlly.hp <= 0) {
                    statusContainer.classList.add("dead");
                } else {
                    statusContainer.classList.remove("dead");
                }
            }

            // 演出判定 (oldAlly が存在する場合のみ HP 減少をチェック)
            const isDamaged = oldAlly && newAlly.hp < oldAlly.hp;
            if (isDamaged) {
                const container = el.hpEl.parentElement;
                if (container) {
                    container.classList.remove("hp-shake");
                    void container.offsetWidth;
                    container.classList.add("hp-shake");
                    setTimeout(() => container.classList.remove("hp-shake"), 400);
                }
                el.hpEl.classList.add("damaged");
                setTimeout(() => el.hpEl.classList.remove("damaged"), 400);
            }

            // 表示用のHP (0未満なら0にする)
            const displayHp = Math.max(0, newAlly.hp);
            const hpRatio = Math.max(0, displayHp / newAlly.maxHp);
            
            // 表示用のMP (MPも念のため)
            const displayMp = Math.max(0, newAlly.mp);
            const mpRatio = Math.max(0, displayMp / newAlly.maxMp);

            // バーの幅更新
            el.hpEl.style.width = `${(hpRatio) * 100}%`;
            el.mpEl.style.width = `${(mpRatio) * 100}%`;

            // テキスト更新 (0 / 100 のように表示される)
            el.hpTextEl.textContent = `${displayHp} / ${newAlly.maxHp}`;
            el.mpTextEl.textContent = `${displayMp} / ${newAlly.maxMp}`;

            // 状態異常アイコン更新
            el.statesEl.innerHTML = "";
            newAlly.states.forEach(state => {
                const icon = ImageStore.get(state.imageKey);
                if (icon) {
                    const iconWrapper = document.createElement("div");
                    iconWrapper.className = "state-icon-wrapper";
                    const iconClone = icon.cloneNode(true) as HTMLImageElement;
                    iconClone.className = "state-icon";
                    if (state.duration > 0) {
                        const durationBadge = document.createElement("span");
                        durationBadge.className = "state-duration-badge";
                        if (state.duration === 1) durationBadge.classList.add("warning");
                        durationBadge.textContent = state.duration.toString();
                        iconWrapper.appendChild(durationBadge);
                    }
                    iconWrapper.appendChild(iconClone);
                    el.statesEl.appendChild(iconWrapper);
                }
            });
        });

        // 【最重要】全ての比較が終わった後に、今回の payload をディープコピーして保存する
        // 参照を切り離すために map とスプレッド演算子を使用
        this.allies = payload.allies.map(ally => ({
            ...ally,
            states: ally.states.map(state => ({ ...state }))
        }));
    }
}