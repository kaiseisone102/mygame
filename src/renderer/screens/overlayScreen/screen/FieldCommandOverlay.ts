// src/renderer/screens/mainScreens/screen/FieldCommandOverlay.ts

import { FieldMagicPayload, SkillItem } from "../../../../shared/type/payload/battle";
import { audioManager } from "../../../../renderer/asset/audio/audioManager";
import { CommonAction, InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../renderer/router/WorldEvent";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";
import { FIELD_COMMANDS_DISPLAY } from "../../../../shared/data/constants";
import { FieldActionType } from "../../../../shared/type/field/FieldActionType";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { SkillRepository } from "../../../../shared/master/battle/SkillRepository";

export class FieldCommandOverlay implements OverlayScreen<FieldMagicPayload[]> {
    readonly overlayId: string = OverlayScreenType.FIELD_COMMAND;
    readonly capturesInput: boolean = true;

    private screen!: HTMLElement;
    private container!: HTMLElement;
    private commandItems: HTMLParagraphElement[] = [];

    private payload!: FieldMagicPayload[];

    private selectedIndex = 0;
    private lastIndex = 0;

    private emitWorld!: (event: WorldEvent) => void;
    private emitUI!: (event: AppUIEvent) => void;

    constructor(private skillRepo: SkillRepository) { }

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        console.log("[FieldCommandOverlay] init");

        this.emitWorld = initCtx.emitWorld
        this.emitUI = initCtx.emitUI;

        // 画面全体
        this.screen = document.createElement("div");
        this.screen.id = "field-command-overlay";
        this.screen.className = "overlay-base"; // 共通クラス
        root.appendChild(this.screen);

        // 枠
        this.container = document.createElement("div");
        this.container.id = "container";
        this.container.className = "dq-window";
        this.screen.appendChild(this.container);

        // コマンド生成
        FIELD_COMMANDS_DISPLAY.forEach((cmd, index) => {
            const p = document.createElement("p");
            p.textContent = cmd.label;

            this.container.appendChild(p);
            this.commandItems.push(p);
        });

        this.updateCommandUI();
        this.hide();
    };

    show(payload: FieldMagicPayload[]): void {
        this.screen.style.display = "block";
        this.payload = payload;

        this.selectedIndex = 0;
        this.updateCommandUI();
    }

    hide(): void {
        this.screen.style.display = "none";
    }

    update(delta: number): void { }

    pause(): void { }

    resume(): void { }

    handleUIActions(actions: UIActionEvent[]): boolean {
        for (const a of actions) {
            switch (a.action) {
                case CommonAction.CONFIRM: {
                    audioManager.playSE("assets/se/decide.mp3");

                    const commandId = FIELD_COMMANDS_DISPLAY[this.selectedIndex].id;

                    switch (commandId) {
                        case FieldActionType.ITEM:
                            break;

                        case FieldActionType.MAGIC:
                            // 例：とりあえずパーティの先頭（主人公）の魔法Payloadを渡す場合
                            // 本来はここで「誰の魔法を見ますか？」というキャラ選択を挟むのが理想
                            const firstActorPayload = this.payload[0];

                            const playerSkill: SkillItem[] = firstActorPayload.skillIds.map(id => {
                                const master = this.skillRepo.get(id);
                                // SkillPreset から SkillItem への詰め替え
                                return {
                                    skillId: master.id,
                                    name: master.name,
                                    description: master.description,
                                    mpCost: master.cost?.mp ?? 0,
                                    target: {
                                        // SkillPreset の targetType と targetSide をそのまま流用
                                        type: master.targetType,
                                        side: master.targetSide
                                    }
                                };
                            })
                                .filter((skill): skill is SkillItem => skill !== undefined);

                            this.emitUI({
                                type: "PUSH_OVERLAY", overlay: OverlayScreenType.SKILL_SELECT_OVERLAY,
                                payload: {
                                    actorInstanceId: firstActorPayload.actorInstanceId,
                                    skillItems: playerSkill, // 詳細データが入った配列
                                    allies: firstActorPayload.allies,   // ターゲット選択用の全員名簿
                                    enemies: []
                                }
                            })
                            break;

                        case FieldActionType.EQUIPMENT:
                            break;

                        case FieldActionType.SAVE:
                            this.emitUI({ type: "SAVE_GAME" });
                            break;

                        case FieldActionType.OPTION:
                            this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.OPTIONS, payload: undefined });
                            break;
                    }
                    return true;
                }
                case CommonAction.CANCEL:
                case CommonAction.INVENTORY:
                    audioManager.playSE("assets/se/cancel.mp3");
                    this.emitUI({ type: "POP_ALL_OVERLAY" });
                    return true;
            }
        }
        return true; // UI入力は常に消費
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        for (const axis of axes) {

            switch (axis) {

                case "UP":
                case "LEFT":
                    this.selectedIndex = (this.selectedIndex - 1 + this.commandItems.length) % this.commandItems.length;
                    break;

                case "DOWN":
                case "RIGHT":
                    this.selectedIndex = (this.selectedIndex + 1) % this.commandItems.length;
                    break;
            }
        }
        // インデックスが変わったときだけSEを鳴らす
        if (this.lastIndex !== this.selectedIndex) {
            audioManager.playSE("assets/se/cursorMove.mp3");
            this.updateCommandUI();
        }

        this.lastIndex = this.selectedIndex;

        this.updateCommandUI();
        return true;
    };

    private updateCommandUI() {
        this.commandItems.forEach((el, i) => {
            el.classList.toggle("selected", i === this.selectedIndex);
        });
    }
}