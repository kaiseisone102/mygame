// src/renderer/screens/battleScene/overlayScreen/BattleTurnDisplayOverlay.ts

import { UIActionEvent, InputAxis } from "../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";

export interface BattleTurnPayload {
    currentTurn: number;
}

export class BattleTurnDisplayOverlay implements OverlayScreen<BattleTurnPayload> {
    readonly overlayId: string = OverlayScreenType.BATTLE_TURN_DISPLAY;
    readonly capturesInput: boolean = false;

    private rootEl!: HTMLElement;
    private screen!: HTMLDivElement;
    private turnText!: HTMLDivElement;
    private currentTurn!: number;

    /** 初期化 */
    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.rootEl = root;

        this.screen = document.createElement("div");
        this.screen.id = "battle-turn-overlay";
        Object.assign(this.screen.style, {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            display: "none",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
        });
        root.appendChild(this.screen);

        this.turnText = document.createElement("div");
        this.turnText.id = "turn-number";
        Object.assign(this.turnText.style, {
            fontSize: "10rem",  // 後でCSSで調整
            color: "white",
            textShadow: "0 0 10px black",
        });
        this.screen.appendChild(this.turnText);
    }

    /** 表示 */
    show(payload: BattleTurnPayload) {
        this.currentTurn = payload.currentTurn;
        this.updateTurnText(this.currentTurn);
        this.screen.style.display = "flex";
    }

    /** 非表示 */
    hide() {
        this.screen.style.display = "none";
    }

    update(delta: number) {
        this.updateTurnText(delta);
    }

    /** ターンテキスト更新 */
    private updateTurnText(delta: number) {
        if (!this.currentTurn) return;
        const turn = delta;
        this.turnText.textContent = `TURN ${turn}`;
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
