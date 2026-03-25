// src/renderer/screens/overlayScreen/screen/ShopOverlay.ts

import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { CommonAction, InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { AppDirection } from "../../../../shared/type/PlayerState";
import { ImageKey } from "../../../../shared/type/ImageKey";

export type ShopItem = {
    id: string;
    name: string;
    description: string;
    price: string;
    icon?: ImageKey;
};

export type ShopPayload = {
    shopItems: ShopItem[];
};

export class ShopOverlay implements OverlayScreen<ShopPayload> {

    readonly overlayId: string = OverlayScreenType.SHOP;
    readonly capturesInput: boolean = true;

    private emitUI!: (event: AppUIEvent) => void;

    private screen!: HTMLElement;
    private listContainer!: HTMLElement;
    private upArrow!: HTMLElement;
    private downArrow!: HTMLElement;

    private items: ShopItem[] = [];
    private selectedIndex: number = 0;

    private viewStartIndex: number = 0;
    private readonly VISIBLE_COUNT: number = 6; // 一度に表示する数

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.emitUI = initCtx.emitUI;

        this.screen = document.createElement("div");
        this.screen.id = "shop-Overlay";

        // --- スクロール矢印（上） ---
        this.upArrow = document.createElement("div");
        this.upArrow.className = "scroll-indicator up";
        this.upArrow.innerText = "▲";
        this.screen.appendChild(this.upArrow);

        const title = document.createElement("div");
        title.className = "shop-title";
        title.innerText = "SHOP / よろず屋";
        this.screen.appendChild(title);

        this.listContainer = document.createElement("div");
        this.listContainer.id = "shop-item-list";
        this.screen.appendChild(this.listContainer);

        // --- スクロール矢印（下） ---
        this.downArrow = document.createElement("div");
        this.downArrow.className = "scroll-indicator down";
        this.downArrow.innerText = "▼";
        this.screen.appendChild(this.downArrow);

        root.appendChild(this.screen);
    }

    show(payload: ShopPayload): void {
        this.items = payload.shopItems;
        this.selectedIndex = 0;
        this.viewStartIndex = 0;
        this.renderList();
        this.screen.style.display = "block"
    };

    hide(): void { this.screen.style.display = "none" };

    update(delta: number): void { };

    handleUIActions(actions: UIActionEvent[]): boolean {
        for (const act of actions) {
            switch (act.action) {
                case CommonAction.CONFIRM:
                    this.emitUI({
                        type: "OPEN_YES_NO",
                        message: `${this.items[this.selectedIndex].name}を購入する？`,
                        onYes: () => this.emitUI({ type: "POP_ALL_OVERLAY" }),
                        onNo: () => this.emitUI({ type: "POP_OVERLAY" })
                    });
                    break;
                case CommonAction.CANCEL:
                    this.emitUI({ type: "POP_OVERLAY" });
                    break;
            }
        }
        return true
    };

    handleUIAxes(axes: InputAxis[]): boolean {
        for (const axis of axes) {
            const prevIndex = this.selectedIndex;

            switch (axis) {
                case AppDirection.UP:
                case AppDirection.RIGHT:
                    if (this.selectedIndex === 0) this.selectedIndex = this.items.length - 1;
                    else this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                    break;
                case AppDirection.DOWN:
                case AppDirection.LEFT:
                    if (this.selectedIndex === this.items.length - 1) this.selectedIndex = 0;
                    else this.selectedIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
                    break;
            }
            if (prevIndex !== this.selectedIndex) {
                this.updateViewWindow(); // 表示窓の位置を計算
                this.renderList(); // 選択状態が変わったら再描画
            }
        }
        return true
    };

    /**
    * カーソル位置に合わせて表示開始インデックス(viewStartIndex)を更新する
    * 上下どちらに動いても、端から3番目を超えたらリストをずらすように調整
    */
    private updateViewWindow(): void {
        const TOP_BUFFER = 3;    // 上から2番目（インデックス2）を越えたらスクロール
        const BOTTOM_BUFFER = 2; // 下から3番目（インデックス3）を越えたらスクロール

        // --- 下方向へのスクロール判定 ---
        // カーソルが「表示窓の開始位置 + 3」より下に行ったら、窓を下にずらす
        if (this.selectedIndex > this.viewStartIndex + BOTTOM_BUFFER) {
            this.viewStartIndex = Math.min(
                this.selectedIndex - BOTTOM_BUFFER,
                Math.max(0, this.items.length - this.VISIBLE_COUNT)
            );
        }

        // --- 上方向へのスクロール判定（今回のメイン修正） ---
        // カーソルが「表示窓の開始位置 + 2」より上に行ったら、窓を上にずらす
        // これにより、下がる時と同様のタイミングで「1つ上のアイテム」が表示されるようになる
        else if (this.selectedIndex < this.viewStartIndex + TOP_BUFFER) {
            this.viewStartIndex = Math.max(
                0,
                this.selectedIndex - TOP_BUFFER
            );
        }
    }

    private renderList(): void {
        this.listContainer.innerHTML = "";

        // 矢印の表示制御
        // viewStartIndex が 0 より大きければ、上に隠れたアイテムがある
        this.upArrow.style.opacity = this.viewStartIndex > 0 ? "1" : "0";

        // (開始位置 + 表示数) が 全体数 より小さければ、下に隠れたアイテムがある
        const hasMoreDown = (this.viewStartIndex + this.VISIBLE_COUNT) < this.items.length;
        this.downArrow.style.opacity = hasMoreDown ? "1" : "0";

        // 全アイテムではなく、viewStartIndex から 6つ分だけを取り出してループ
        const visibleItems = this.items.slice(this.viewStartIndex, this.viewStartIndex + this.VISIBLE_COUNT);

        visibleItems.forEach((item, index) => {
            // visibleItems内のindexではなく、元のitems配列でのインデックスを計算
            const actualIndex = this.viewStartIndex + index;
            const isSelected = actualIndex === this.selectedIndex;

            const itemEl = document.createElement("div");
            itemEl.className = `shop-item ${isSelected ? "selected" : ""}`;

            // 構造を整理：左に名前、右に価格と説明
            itemEl.innerHTML = `
                <div class="item-info-main">
                    <span class="item-name">${item.name}</span>
                </div>
                <div class="item-info-sub">
                    <span class="item-price">${item.price} <small>yen</small></span>
                    <div class="item-desc">${item.description}</div>
                </div>
            `;

            this.listContainer.appendChild(itemEl);
        });
    }
}