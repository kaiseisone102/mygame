// src/renderer/screens/battleScreens/overlayScreen/SkillSelectOverlay.ts

import { audioManager } from "../../../asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "../../../input/mapping/InputMapper";
import { AppUIEvent } from "../../../router/AppUIEvents";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { OverlayScreen } from "../../interface/overlay/OverLayScreens";
import { SkillId } from "../../../../shared/master/battle/type/SkillPreset";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { CommandSelectedPayload } from "./BattleBasicCommandOverlay";

export type SelectedSkillPayload = {
    phaseBase: CommandSelectedPayload,
    skillId: SkillId
};

export type SkillItem = {
    skillId: SkillId;
    name: string;
    description: string;
    mpCost: number;
};

export class SkillSelectOverlay implements OverlayScreen<CommandSelectedPayload> {
    readonly capturesInput: true = true;
    readonly overlayId: string = OverlayScreenType.SKILL_SELECT_OVERLAY;

    private payload!: CommandSelectedPayload;
    private skills: SkillItem[] = [];

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

    show(payload: CommandSelectedPayload): void {
        this.screen.style.display = "block";
        this.payload = payload;

        // スキル配列を保持
        this.skills = payload.phaseBase.skills || [];

        this.currentPage = 0;

        this.renderPage();
    }

    hide(): void {
        this.screen.style.display = "none";
    }

    update(delta: number): void { }

    pause(): void { }

    handleUIAxes(axes: InputAxis[]): boolean {
        const cols = 2;
        const rows = Math.ceil(this.items.length / cols);
        const totalPages = Math.ceil(this.skills.length / this.skillsPerPage);

        for (const axis of axes) {

            let row = Math.floor(this.selectedIndex / cols);
            let col = this.selectedIndex % cols;

            switch (axis) {

                case "UP":
                    let newRow = row - 1;
                    if (newRow < 0) newRow = rows - 1;

                    let newIndex = newRow * cols + col;

                    if (newIndex >= this.items.length) {
                        newIndex = Math.max(newIndex - cols, 0);
                    };

                    this.selectedIndex = newIndex;
                    this.updateCursor();
                    audioManager.playSE("assets/se/cursorMove.mp3");
                    return true;

                case "DOWN":
                    row = (row + 1) % rows;
                    break;

                case "LEFT":

                    if (col === 0) {
                        // 左端 → 前ページ
                        const prevRow = row;

                        if (this.currentPage > 0) {
                            this.prevPage();
                        } else {
                            this.currentPage = totalPages - 1;
                            this.renderPage();
                        };

                        const newRows = Math.ceil(this.items.length / cols);
                        row = Math.min(prevRow, newRows - 1);
                        col = 1;

                    } else {
                        col = 0;
                    }

                    break;

                case "RIGHT":

                    if (col === 1) {

                        const prevRow = row;

                        if (this.currentPage < totalPages - 1) {
                            this.nextPage();
                        } else {
                            this.currentPage = 0;
                            this.renderPage();
                        };

                        const newRows = Math.ceil(this.items.length / cols);
                        row = Math.min(prevRow, newRows - 1);
                        col = 0;

                    } else {

                        if (this.items.length === 1) {

                            const prevRow = row;

                            if (this.currentPage < totalPages - 1) {
                                this.nextPage();
                            } else {
                                this.currentPage = 0;
                                this.renderPage();
                            }

                            const newRows = Math.ceil(this.items.length / cols);
                            row = Math.min(prevRow, newRows - 1);
                            col = 0;

                        } else if (this.selectedIndex + 1 >= this.items.length) {

                            this.selectedIndex = this.selectedIndex - 1
                            this.updateCursor()
                            return true

                        }

                        col = 1;
                    }

                    break;
            }

            this.selectedIndex = row * cols + col;

            if (this.selectedIndex >= this.items.length) {
                this.selectedIndex = this.items.length - 1;
            };
        };
        if (this.selectedIndex < 0) this.selectedIndex = 0;
        if (this.selectedIndex >= this.items.length) this.selectedIndex = this.items.length - 1;

        this.updateCursor();
        audioManager.playSE("assets/se/cursorMove.mp3");
        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        for (const e of events) {
            switch (e.action) {
                case "CONFIRM": {
                    const start = this.currentPage * this.skillsPerPage;
                    const selectedSkill = this.skills[start + this.selectedIndex];
                    this.emitUI({
                        type: "SKILL_SELECTED",
                        payload: { phaseBase: this.payload, skillId: selectedSkill.skillId }
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
            const skill = this.skills[start + this.selectedIndex];
            this.updateDescriptionAndCost(skill);
        }
    }

    private nextPage() {
        const totalPages = Math.ceil(this.skills.length / this.skillsPerPage);
        this.currentPage = (this.currentPage + 1) % totalPages;
        this.renderPage();
    }

    private prevPage() {
        const totalPages = Math.ceil(this.skills.length / this.skillsPerPage);
        this.currentPage = (this.currentPage - 1 + totalPages) % totalPages;
        this.renderPage();
    }

    private renderPage() {
        const listArea = this.screen.querySelector(".magic-list") as HTMLElement;
        listArea.innerHTML = "";
        this.items = [];

        const start = this.currentPage * this.skillsPerPage;
        const end = start + this.skillsPerPage;
        const pageSkills = this.skills.slice(start, end);

        pageSkills.forEach(skill => {
            const item = document.createElement("div");
            item.className = "magic-item";
            item.textContent = skill.name;
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