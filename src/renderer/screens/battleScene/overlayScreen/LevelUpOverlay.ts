// src/renderer/screens/battleScene/overlayScreen/LevelUpOverlay.ts

import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { UIActionEvent, InputAxis } from "../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { BaseStats } from "shared/data/playerConstants";

export type LevelUpPayload = {
    name: string;
    oldLevel: number;
    newLevel: number;
    oldStats: BaseStats;
    newStats: BaseStats;
};

export class LevelUpOverlay implements OverlayScreen<LevelUpPayload[]> {
    readonly overlayId: string = OverlayScreenType.LEVEL_UP_OVERLAY;
    readonly capturesInput: boolean = true;

    private screen!: HTMLDivElement;
    private messageElem!: HTMLDivElement;
    private currentPayload!: LevelUpPayload;

    private emitUI!: (event: AppUIEvent) => void;
    private resolvePromise?: () => void;

    /** 初期化 */
    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.emitUI = initCtx.emitUI;

        this.screen = document.createElement("div");

        this.messageElem = document.createElement("div");
        this.screen.appendChild(this.messageElem);

        root.appendChild(this.screen);
    }

    /** 表示 */
    async show(payloads: LevelUpPayload[]): Promise<void> {
        await this.playLevelUps(payloads);
    }

    /** 非表示 */
    hide() {
        this.screen.style.display = "none";
    }

    update(delta: number) {
    }


    pause() { }
    resume() { }

    handleUIActions(actions: UIActionEvent[]): boolean {
        for (const action of actions)
            if (action.action === "CONFIRM" && this.resolvePromise) {
                this.resolvePromise();
                return true;
            }
        return true;
    }
    handleUIAxes(axes: InputAxis[]): boolean {
        return true;
    }

    /** payload を表示して、CONFIRM まで待機する */
    private async playLevelUps(payloads: LevelUpPayload[]): Promise<void> {

        for (const payload of payloads) {
            this.showSingle(payload);

            await new Promise<void>(resolve => {
                this.resolvePromise = () => {
                    this.hide();
                    this.resolvePromise = undefined;
                    resolve();
                };
            });
        }
    }

    private showSingle(payload: LevelUpPayload) {
        this.currentPayload = payload;
        this.screen.className = "LevelUpOverlay";
        this.messageElem.className = "LevelUpOverlayMessage";

        // メッセージ部分の構築
        let html = `<div class="characterName">${payload.name} はレベルアップした！</div>`;
        html += `<div class="levelTransition">Level ${payload.oldLevel} → <span class="newLevel">${payload.newLevel}</span></div>`;

        // ステータス変化表の構築
        html += `<div class="statsContainer">`;

        // 表示したいステータス項目のリスト
        const statKeys: (keyof BaseStats)[] = [
            "maxHp", "maxMp", "attack", "defense", "magic", "speed", "luck"
        ];

        for (const key of statKeys) {
            const oldVal = payload.oldStats[key];
            const newVal = payload.newStats[key];
            const diff = newVal - oldVal;

            html += `
                    <div class="statRow">
                        <span class="statName">${this.getStatDisplayName(key)}</span>
                        <span class="statValues">${oldVal} → ${newVal}</span>
                        <span class="statDiff">${diff > 0 ? `(+${diff})` : ""}</span>
                    </div>`;
        }

        html += `</div>`;
        this.messageElem.innerHTML = html;

        // CONFIRM 要素を作って追加
        const confirmElem = document.createElement("div");
        confirmElem.className = "confirmText";
        confirmElem.textContent = "PRESS ENTER";  // ここで文字を設定
        this.messageElem.appendChild(confirmElem);

        this.screen.style.display = "flex";
    }

    /** キー名を日本語名に変換 */
    private getStatDisplayName(key: keyof BaseStats): string {
        const names: Record<keyof BaseStats, string> = {
            hp: "HP", maxHp: "最大HP",
            mp: "MP", maxMp: "最大MP",
            attack: "攻撃力", defense: "守備力",
            magic: "魔法力", speed: "素早さ",
            luck: "運の良さ", avoid: "回避率",
            crtical: "会心率"
        };
        return names[key] || key;
    }
}
