// src/renderer/screens/hud/GoldHud.ts

import { OverlayScreenType } from "../../../../shared/type/screenType";
import { GameState } from "../../../../shared/data/gameState";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { OverlayScreen } from "../../interface/overlay/OverLayScreens";
import { InputAxis, UIActionEvent } from "renderer/input/mapping/InputMapper";

/**
 * GoldHud
 *
 * オーバーレイスタックから独立した所持金表示。
 * - root 直下に固定配置(position: fixed / 左上)
 * - 入力は一切奪わない(pointer-events: none)
 * - 表示/非表示と金額は ScreenManager が毎フレーム render() で制御する
 *
 * スタックに積まないので、どのオーバーレイが上に来ても影響を受けない。
 */
export class GoldHud implements OverlayScreen<GoldHudPayload> {
    readonly overlayId: string = OverlayScreenType.GoldHud;
    readonly capturesInput: boolean = false;

    private container!: HTMLElement;
    private goldTextEl!: HTMLElement;
    private currencySymbol!: HTMLElement;

    private visible = false;
    private lastText = "";

    constructor(private gameState: GameState) { }

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.container = document.createElement("div");
        this.container.id = "gold-hud";

        this.goldTextEl = document.createElement("div");
        this.goldTextEl.id = "gold-text-el";

        this.currencySymbol = document.createElement("div");
        this.currencySymbol.id = "currency-symbol";
        this.currencySymbol.textContent = "G";

        // CSS に依存せず確実に左上へ出すためインラインで指定
        Object.assign(this.container.style, {
            position: "fixed",
            top: "5%",
            left: "5%",
            zIndex: "1",            // どのオーバーレイより手前
            padding: "4px 12px",
            width: "12vw",
            height: "5vw",
            background: "rgba(0, 0, 0, 0.65)",
            color: "#ffd23f",
            fontSize: "4vw",
            fontWeight: "bold",
            fontFamily: "'DotGothic16', monospace, sans-serif",
            border: "2px solid #ffd23f",
            borderRadius: "6px",
            letterSpacing: "1px",
            pointerEvents: "none",      // 下の要素のクリック/入力を妨げない
            userSelect: "none",
            display: "none",

            boxSizing: "border-box",         // paddingをwidth/heightの計算に含める(レイアウト崩れ防止)
            flexDirection: "row",            // 横並び
            justifyContent: "space-between", // 左端(シンボル)と右端(数字)にスペースを空けて配置
            alignItems: "center",            // 縦方向の中央揃え
        } as Partial<CSSStyleDeclaration>);

        Object.assign(this.currencySymbol.style, {
            flexShrink: "0",                 // 画面幅が狭まってもシンボルが潰れないようにする
            marginRight: "8px",              // 数字との最低限の隙間を確保
        });

        // 数字側のスタイル
        Object.assign(this.goldTextEl.style, {
            flexGrow: "1",                   // 残りの横幅をすべて数字側の領域として使う
            textAlign: "right",              // その領域内で右詰めにする
            overflow: "hidden",              // 桁数が増えすぎた時の保険
            textOverflow: "ellipsis",        // はみ出た場合は「...」にする(必要に応じて)
        });

        this.container.appendChild(this.currencySymbol);
        this.container.appendChild(this.goldTextEl);
        root.appendChild(this.container);
    }

    show(payload: GoldHudPayload): void {
        this.goldTextEl.textContent = String(payload.currentGold);
        this.container.style.display = "flex";
    }

    hide(): void {
        this.container.style.display = "none";
    }

    handleUIActions(actions: UIActionEvent[]): boolean {
        return false;
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        return false;
    }

    update(delta: number): void {

    }
}

export type GoldHudPayload = {
    currentGold: number
}
