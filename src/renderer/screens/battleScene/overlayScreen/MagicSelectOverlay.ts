// src/renderer/screens/battleScreens/overlayScreen/MagicSelectOverlay.ts

import { audioManager } from "../../../../renderer/asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { SkillId } from "../../../../shared/master/battle/type/SkillPreset";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { CommandSelectedPayload } from "./BattleBasicCommandOverlay";

export type SelectedMagicPayload = {
    phaseBase: CommandSelectedPayload,
    skillId: SkillId
}
export class MagicSelectOverlay implements OverlayScreen<CommandSelectedPayload> {
    readonly capturesInput: true = true;
    readonly overlayId: string = OverlayScreenType.MAGIC_SELECT_OVERLAY;

    private payload!: CommandSelectedPayload;

    private screen!: HTMLElement;

    private items: HTMLElement[] = [];
    private selectedIndex: number = 0;

    private emitUI!: (event: AppUIEvent) => void;
    constructor() { }

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.emitUI = initCtx.emitUI;

        // 全体のコンテナ
        this.screen = document.createElement("div");
        this.screen.id = "magic-select-overlay";
        root.appendChild(this.screen);

        // 魔法一覧リスト　1ページごとに２列、６行
        const listArea = document.createElement("div");
        listArea.className = "magic-list";
        this.screen.appendChild(listArea);

        // 仮：12個(2列×6行)
        for (let i = 0; i < 12; i++) {
            const item = document.createElement("div");
            item.className = "magic-item";
            item.textContent = `magic ${"ライデイン"}`;

            listArea.appendChild(item);
            this.items.push(item);
        }

        // 魔法効果説明欄
        const description = document.createElement("div");
        description.className = "magic-description";
        description.textContent = "魔法の説明: でんげき";
        this.screen.appendChild(description);

        // 魔法で消費するMP欄
        const mpCost = document.createElement("div");
        mpCost.className = "magic-mp";
        mpCost.textContent = "MP: 8";
        this.screen.appendChild(mpCost);
    }

    show(payload: CommandSelectedPayload): void {
        this.screen.style.display = "block";
        this.payload = payload;
        this.updateCursor();
    }

    hide(): void {
        this.screen.style.display = "none";
    }

    update(delta: number): void {

    }

    pause(): void {

    }

    handleUIAxes(axes: InputAxis[]): boolean {
        for (const axis of axes) {

            switch (axis) {
                // 動きのイメージ=>上の行に行く,1行目2列目でで上を押すと6行目2列目に移動
                case "UP":
                    this.selectedIndex -= 2;
                    if (this.selectedIndex < 0) this.selectedIndex += 12;
                    break;
                case "DOWN":
                    this.selectedIndex += 2;
                    if (this.selectedIndex >= 12) this.selectedIndex -= 12;
                    break;
                // 動きのイメージ=>列の移動,2行目の1列目で左を押すと2行目の2列目に移動
                case "LEFT":
                    this.selectedIndex -= 1;

                    if (this.selectedIndex % 2 === 1) {
                        this.selectedIndex += 2;
                    }
                    break;

                case "RIGHT":
                    this.selectedIndex += 1;

                    if (this.selectedIndex % 2 === 0) {
                        this.selectedIndex -= 2;
                    }
                    break;
            }
        }
        this.updateCursor();
        audioManager.playSE("assets/se/cursorMove.mp3");

        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        for (const e of events) {
            switch (e.action) {
                case "CONFIRM": {
                    this.emitUI({ type: "MAGIC_SELECTED", payload: { phaseBase: this.payload, skillId: SkillId.RAIDEIN } })
                }
            }
        }
        audioManager.playSE("assets/se/decide.mp3");
        return true;
    }

    private updateCursor() {

        for (let i = 0; i < this.items.length; i++) {
            this.items[i].classList.remove("selected");
        }

        this.items[this.selectedIndex].classList.add("selected");
    }
}