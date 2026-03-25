// src/renderer/screens/battleScreens/overlayScreen/SkillSelectOverlay.ts

import { audioManager } from "../../../asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "../../../input/mapping/InputMapper";
import { AppUIEvent } from "../../../router/AppUIEvents";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { OverlayScreen } from "../../interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { MenuGridNavigator } from "../../../../renderer/ui/utils/GridSelector";
import { SkillSelectPayload, SkillItem } from "../../../../shared/type/payload/battle";

export class SkillSelectOverlay implements OverlayScreen<SkillSelectPayload> {
    readonly capturesInput: true = true;
    readonly overlayId: string = OverlayScreenType.SKILL_SELECT_OVERLAY;

    private navigator = new MenuGridNavigator(12, 2);

    private payload!: SkillSelectPayload;
    private skillItems: SkillItem[] = [];

    private screen!: HTMLElement;
    private items: HTMLElement[] = [];
    private selectedIndex: number = 0;
    private emitUI!: (event: AppUIEvent) => void;

    private currentPage = 0;
    private skillsPerPage = 12; // 2列 × 6行

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

        // 魔法効果説明欄
        const description = document.createElement("div");
        description.className = "magic-description";
        this.screen.appendChild(description);

        // 魔法で消費するMP欄
        const mpCost = document.createElement("div");
        mpCost.className = "magic-mp";
        this.screen.appendChild(mpCost);
    }

    show(payload: SkillSelectPayload): void {
        this.screen.style.display = "block";
        this.payload = payload;

        // スキル配列を保持
        this.skillItems = payload.skillItems || [];

        this.currentPage = 0;

        this.renderPage();
    }

    hide(): void {
        this.screen.style.display = "none";
    }

    update(delta: number): void { }

    pause(): void { }

    handleUIAxes(axes: InputAxis[]): boolean {
        for (const axis of axes) {
            const result = this.navigator.handleMove(
                axis as any,
                { selectedIndex: this.selectedIndex, currentPage: this.currentPage },
                this.skillItems.length,
                (targetPage) => {
                    // ページが変わる「前」に、そのページのアイテム数を教える必要がある
                    const start = targetPage * this.skillsPerPage;
                    const end = start + this.skillsPerPage;
                    return this.skillItems.slice(start, end).length;
                }
            );

            if (result.currentPage !== this.currentPage) {
                this.currentPage = result.currentPage;
                this.renderPage();
            }
            this.selectedIndex = result.selectedIndex;

            this.updateCursor();
            audioManager.playSE("assets/se/cursorMove.mp3");
        }

        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        for (const e of events) {
            switch (e.action) {
                case "CONFIRM": {
                    const start = this.currentPage * this.skillsPerPage;
                    const selectedSkill = this.skillItems[start + this.selectedIndex];
                    this.emitUI({
                        type: "SKILL_SELECTED",
                        payload: {
                            skillId: selectedSkill.skillId,
                            allies: this.payload.allies,
                            enemies: this.payload.enemies,
                            target: selectedSkill.target
                        }
                    });
                    audioManager.playSE("assets/se/decide.mp3");
                    break;
                }
                case "CANCEL": this.emitUI({ type: "POP_OVERLAY" }); break;
            };
        };
        return true;
    };

    private updateDescriptionAndCost(selectedSkill: SkillItem) {
        const description = this.screen.querySelector(".magic-description") as HTMLElement;
        const mpCost = this.screen.querySelector(".magic-mp") as HTMLElement;

        description.textContent = selectedSkill.description ? `魔法の説明: ${selectedSkill.description}` : "魔法の説明: 未設定";
        if (selectedSkill.mpCost !== undefined) {
            mpCost.textContent = `MP: ${selectedSkill.mpCost}`;
        } else {
            mpCost.textContent = "";
        }
    }

    private updateCursor() {
        const start = this.currentPage * this.skillsPerPage;
        // 選択中ハイライト
        this.items.forEach(item => item.classList.remove("selected"));
        if (this.items[this.selectedIndex]) {
            this.items[this.selectedIndex].classList.add("selected");
            const skill = this.skillItems[start + this.selectedIndex];
            this.updateDescriptionAndCost(skill);
        }
    }

    private renderPage() {
        const listArea = this.screen.querySelector(".magic-list") as HTMLElement;
        listArea.innerHTML = "";
        this.items = [];

        const start = this.currentPage * this.skillsPerPage;
        const end = start + this.skillsPerPage;
        const pageSkills = this.skillItems.slice(start, end);

        pageSkills.forEach(skillItems => {
            const item = document.createElement("div");
            item.className = "magic-item";
            item.textContent = skillItems.name;
            listArea.appendChild(item);
            this.items.push(item);
        });

        // selectedIndex がページ内の範囲を超えていたら調整
        if (this.selectedIndex >= this.items.length) {
            this.selectedIndex = this.items.length - 1;
        }

        this.updateCursor();
    }
}