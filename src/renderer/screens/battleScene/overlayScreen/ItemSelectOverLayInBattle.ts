// src/renderer/screens/battleScene/overlayScreen/ItemSelectOverLayInBattle.ts

import { audioManager } from "../../../../renderer/asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../renderer/router/WorldEvent";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { OverlayScreen } from "../../interface/overlay/OverLayScreens";
import { BattleState } from "../../../../renderer/game/battle/core/BattleState";
import { OverlayScreenType } from "../../../../shared/type/screenType";

export type BattleItem = {
    id: string;
    name: string;
    exist: boolean;
};

export class ItemSelectOverLayInBattle implements OverlayScreen {
    readonly overlayId: string = OverlayScreenType.ITEM_SELECT_OVERLAY_IN_BATTLE;

    readonly capturesInput: true = true;

    private screen!: HTMLElement;
    private target!: HTMLElement;
    private commandItems: HTMLParagraphElement[] = [];
    private selectedIndex = 0;
    private items: BattleItem[] = [];

    private battleState!: BattleState;

    private emitWorld!: (event: WorldEvent) => void;
    private emitUI!: (event: AppUIEvent) => void;

    private ctx!: ScreenInitContext;

    constructor() { }

    /**
     * 画面初期化
     */
    init(root: HTMLElement, initCtx: ScreenInitContext) {
        console.log("[ItemSelectOverLayInBattle] init");

        this.ctx = initCtx;
        this.emitWorld = this.ctx.emitWorld
        this.emitUI = this.ctx.emitUI;

        // 画面全体
        this.screen = document.createElement("div");
        this.screen.id = "itemSelectOverLayInBattle";
        root.appendChild(this.screen);

        this.target = document.createElement("div");
        this.target.className = "itemList";
        this.screen.appendChild(this.target);

        // 仮の道具データ
        this.items = [
            { id: "healRoot", name: "healroot A", exist: true },
            { id: "healRoot", name: "healroot B", exist: true },
            { id: "healRoot", name: "healroot C", exist: false },
        ];

        this.buildItemList();
        this.updateCommandTargetUI();
        this.hide();
    }

    show() {
        this.screen.style.display = "block"; // DOM 表示
        this.renderItems();                 // 道具リスト描画(アイコンとか？)
    }

    hide() {
        this.screen.style.display = "none";
    }

    update(delta: number): void {

    }

    /* =====================
          Input
    ===================== */

    /**
     * UI Axis 入力
     * - UP / LEFT : 前のスロット
     * - DOWN / RIGHT : 次のスロット
     */
    handleUIAxes(axes: InputAxis[]): boolean {

        for (const axis of axes) {

            switch (axis) {
                case "UP":
                case "LEFT":
                    this.selectedIndex =
                        (this.selectedIndex - 1 + this.commandItems.length) %
                        this.commandItems.length;
                    this.updateCommandTargetUI();
                    audioManager.playSE("assets/se/cursorMove.mp3");
                    break;

                case "DOWN":
                case "RIGHT":
                    this.selectedIndex =
                        (this.selectedIndex + 1) %
                        this.commandItems.length;
                    this.updateCommandTargetUI();
                    audioManager.playSE("assets/se/cursorMove.mp3");
                    break;
            }
        }
        return true;
    }

    /**
     * UI Action 入力
     * - CONFIRM : コマンド実行
     * - CANCEL  : BattleBasicCommandOverlay へ
     */
    handleUIActions(events: UIActionEvent[]): boolean {
        for (const e of events) {
            switch (e.action) {
                case "CONFIRM": {
                    audioManager.playSE("assets/se/decide.mp3");

                    const el = this.commandItems[this.selectedIndex];
                    const itemId = String(el.dataset.itemId);

                    this.emitUI?.({
                        type: "ITEM_SELECTED",
                        itemId: itemId
                    });

                    return true;
                }
                case "CANCEL":
                    this.emitUI?.({ type: "POP_OVERLAY" });
                    break;
            }
        }
        return true;
    }

    private buildItemList() {
        this.target.innerHTML = "";
        this.commandItems = [];

        const existItems = this.items.filter(e => e.exist);

        existItems.forEach(item => {
            const p = document.createElement("p");
            p.textContent = item.name;
            p.dataset.itemId = String(item.id);

            this.target.appendChild(p);
            this.commandItems.push(p);
        });

        this.selectedIndex = 0;
    }


    private updateCommandTargetUI() {
        this.commandItems.forEach((el, i) => {
            el.classList.toggle("selected", i === this.selectedIndex);
        });
    }

    setBattleState(state: BattleState) {
        this.battleState = state;
    }

    /**
     * 使用可能な道具をセット
     */
    setItems(items: BattleItem[]) {
        this.items = items;
        this.renderItems();
    }

    private renderItems() {
        // DOM を作って敵を表示する処理
        console.log("Rendering items:", this.items);
        // 例えば this.rootElement に表示
    }
}
