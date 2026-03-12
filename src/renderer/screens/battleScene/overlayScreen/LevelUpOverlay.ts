// src/renderer/screens/battleScene/overlayScreen/LevelUpOverlay.ts

import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { UIActionEvent, InputAxis } from "../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";

export type LevelUpPayload = {
    name: string;
    oldLevel: number;
    newLevel: number;
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

        this.messageElem.innerHTML = `${payload.name} はレベル <span class="levelNumber">${payload.oldLevel}</span> → <span class="levelNumber">${payload.newLevel}</span> に上がった！`;
        
        // CONFIRM 要素を作って追加
        const confirmElem = document.createElement("div");
        confirmElem.className = "confirmText";
        confirmElem.textContent = "[CONFIRM]";  // ここで文字を設定
        this.messageElem.appendChild(confirmElem);
        
        this.screen.style.display = "flex";
    }
}
