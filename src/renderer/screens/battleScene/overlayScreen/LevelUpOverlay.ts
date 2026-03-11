// src/renderer/screens/battleScene/overlayScreen/LevelUpOverlay.ts

import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { UIActionEvent, InputAxis } from "../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";

export type LevelUpPayload = {
    ally: {
        name: string;
        oldLevel: number;
        newLevel: number;
    };
};

export class LevelUpOverlay implements OverlayScreen<LevelUpPayload> {
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
        this.screen.style.position = "absolute";
        this.screen.style.top = "0";
        this.screen.style.left = "0";
        this.screen.style.width = "100%";
        this.screen.style.height = "100%";
        this.screen.style.display = "none";
        this.screen.style.justifyContent = "center";
        this.screen.style.alignItems = "center";
        this.screen.style.background = "rgba(0,0,0,0.7)";
        this.screen.style.color = "white";
        this.screen.style.fontSize = "24px";
        this.screen.style.textAlign = "center";

        this.messageElem = document.createElement("div");
        this.screen.appendChild(this.messageElem);

        root.appendChild(this.screen);
    }

    /** 表示 */
    show(payload: LevelUpPayload) {
        this.currentPayload = payload;
        this.screen.className = "LevelUpOverlay";
        this.messageElem.className = "LevelUpOverlayMessage";

        // レベルの数字だけ span で囲む
        this.messageElem.innerHTML = `${payload.ally.name} はレベル <span class="levelNumber">${payload.ally.oldLevel}</span> → <span class="levelNumber">${payload.ally.newLevel}</span> に上がった！`;

        this.screen.style.display = "flex";
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
                this.emitUI({ type: "POP_OVERLAY" })
                return true;
            }
        return true;
    }
    handleUIAxes(axes: InputAxis[]): boolean {
        return true;
    }

    /** payload を表示して、CONFIRM まで待機する */
    async playLevelUps(payload: LevelUpPayload[]): Promise<void> {
        this.show(payload);

        return new Promise((resolve) => {
            this.resolvePromise = () => {
                this.screen.style.display = "none";
                this.resolvePromise = undefined;
                resolve();
            };
        });
    }
}
