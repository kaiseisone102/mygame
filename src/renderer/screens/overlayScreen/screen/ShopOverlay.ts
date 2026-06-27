// src/renderer/screens/overlayScreen/screen/ShopOverlay.ts

import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../renderer/router/WorldEvent";
import { CommonAction, InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { AppDirection } from "../../../../shared/type/PlayerState";
import { ImageKey } from "../../../../shared/type/ImageKey";
import { GameState } from "../../../../shared/data/gameState";
import { isEquipmentId } from "../../../../shared/master/battle/EquipmentPreset";
import { isMaterialId } from "../../../../shared/master/item/MaterialPreset";

export type ShopItem = {
    id: string;
    name: string;
    description: string;
    price: number;        // 価格(ゴールド)
    itemId?: string;      // 購入で付与する実アイテムID(ItemPresetsById のキー)。未指定なら id を付与
    amount?: number;      // 一度に手に入る個数(既定1)
    icon?: ImageKey;
};

export type ShopPayload = {
    shopItems: ShopItem[];
};

export class ShopOverlay implements OverlayScreen<ShopPayload> {

    readonly overlayId: string = OverlayScreenType.SHOP;
    readonly capturesInput: boolean = true;

    private emitUI!: (event: AppUIEvent) => void;
    private emitWorld!: (event: WorldEvent) => void;

    private screen!: HTMLElement;
    private listContainer!: HTMLElement;
    private upArrow!: HTMLElement;
    private downArrow!: HTMLElement;

    private items: ShopItem[] = [];
    private selectedIndex: number = 0;

    private viewStartIndex: number = 0;
    private readonly VISIBLE_COUNT: number = 6; // 一度に表示する数

    constructor(private gameState: GameState) { }

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.emitUI = initCtx.emitUI;
        this.emitWorld = initCtx.emitWorld;

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
                case CommonAction.CONFIRM: {
                    const item = this.items[this.selectedIndex];
                    if (!item) break;

                    // 残高不足なら購入させない
                    if (this.gameState.getSyncGold() < item.price) {
                        this.emitUI({
                            type: "PUSH_OVERLAY",
                            overlay: OverlayScreenType.MESSAGE_LOG,
                            payload: { messages: [`ゴールドが足りない…(所持 ${this.gameState.getSyncGold()} / 価格 ${item.price})`] }
                        });
                        break;
                    }

                    this.emitUI({
                        type: "OPEN_YES_NO",
                        message: `${item.name} を ${item.price.toLocaleString()} yen で購入する？`,
                        onYes: () => {
                            this.purchase(item);
                            // YesNo を閉じてショップに戻る(所持金は purchase 内で再描画済み)
                            this.emitUI({ type: "POP_OVERLAY" });
                        },
                        onNo: () => this.emitUI({ type: "POP_OVERLAY" })
                    });
                    break;
                }
                case CommonAction.CANCEL:
                    // ショップと、その下に敷いた所持金HUDをまとめて閉じる
                    this.emitUI({ type: "POP_ALL_OVERLAY" });
                    break;
            }
        }
        return true
    };

    /**
     * 購入処理: ゴールドを消費し、実アイテム(または id)を所持品へ加える
     */
    private purchase(item: ShopItem): void {
        // 残高は CONFIRM 時点で確認済み(足りなければ購入確認へ進めない)。
        // ゴールド変動は emitWorld(状態変更)で行い、HUDは emitUI(REFRESH_GOLD)で更新する。
        this.emitWorld({ type: "CHANGE_GOLD", amount: -item.price });

        const grantId = item.itemId ?? item.id;
        const amount = item.amount ?? 1;
        // 付与先を id の種別で振り分ける: 装備 → 装備在庫 / マテリアル → 素材在庫 / それ以外 → 道具
        if (isEquipmentId(grantId)) {
            this.gameState.addEquipment(grantId, amount);
        } else if (isMaterialId(grantId)) {
            this.gameState.addMaterial(grantId, amount);
        } else {
            this.gameState.collectItem(grantId, amount);
        }

        this.emitUI({ type: "REFRESH_GOLD" }); // 左上の所持金HUDを更新
        this.renderList();                     // ショップ内の購入可否(残高)表示を更新
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        if (this.items.length === 0) return true;

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
    */
    private updateViewWindow(): void {
        const TOP_BUFFER = 3;
        const BOTTOM_BUFFER = 2;

        if (this.selectedIndex > this.viewStartIndex + BOTTOM_BUFFER) {
            this.viewStartIndex = Math.min(
                this.selectedIndex - BOTTOM_BUFFER,
                Math.max(0, this.items.length - this.VISIBLE_COUNT)
            );
        }
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
        this.upArrow.style.opacity = this.viewStartIndex > 0 ? "1" : "0";
        const hasMoreDown = (this.viewStartIndex + this.VISIBLE_COUNT) < this.items.length;
        this.downArrow.style.opacity = hasMoreDown ? "1" : "0";

        const visibleItems = this.items.slice(this.viewStartIndex, this.viewStartIndex + this.VISIBLE_COUNT);

        visibleItems.forEach((item, index) => {
            const actualIndex = this.viewStartIndex + index;
            const isSelected = actualIndex === this.selectedIndex;
            const affordable = this.gameState.getSyncGold() >= item.price;

            const itemEl = document.createElement("div");
            itemEl.className = `shop-item ${isSelected ? "selected" : ""} ${affordable ? "" : "unaffordable"}`;

            itemEl.innerHTML = `
                <div class="item-info-main">
                    <span class="item-name">${item.name}</span>
                </div>
                <div class="item-info-sub">
                    <span class="item-price">${item.price.toLocaleString()} <small>yen</small></span>
                    <div class="item-desc">${item.description}</div>
                </div>
            `;

            this.listContainer.appendChild(itemEl);
        });
    }
}
