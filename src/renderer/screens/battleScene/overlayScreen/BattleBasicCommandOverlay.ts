// src/renderer/screens/battleScreen/overlayScreen/BattleBasicCommandOverlay.ts

import { audioManager } from "../../../asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "../../../input/mapping/InputMapper";
import { AppUIEvent } from "../../../router/AppUIEvents";
import { WorldEvent } from "../../../router/WorldEvent";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { BattleState } from "../../../game/battle/core/BattleState";
import { BattleResult, CommandActionType } from "../../../../shared/type/battle/TargetType";
import { BattleEnemy } from "./AttackTargetOverlay";
import { OverlayScreen } from "../../interface/overlay/OverLayScreens";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { SkillItem } from "./SkillSelectOverlay";
import { BASIC_COMMANDS_DISPLAY } from "../../../../shared/data/constants";

export type BasicCommandPayload = {
    actorTemplateId: number;
    actorInstanceId: number;
    actorName: string,
    enemies: BattleEnemy[],
    skills: SkillItem[]
}

export type CommandSelectedPayload = {
    phaseBase: BasicCommandPayload,
    commandId: CommandActionType
}

/**
 * BattleBasicCommandOverlay
 * 
 * 役割:
 * - 戦闘画面(ターン性コマンドバトル)
 * - コマンドUI
 * 
 * 【保証しない】
 * - BattleAction 
 * - 生成Queue 
 * - 管理phase 
 * - 判定勝敗判断
 */
export class BattleBasicCommandOverlay implements OverlayScreen<BasicCommandPayload> {
    readonly overlayId: string = OverlayScreenType.BATTLE_BASIC_COMMAND_OVERLAY;

    readonly capturesInput: true = true;

    private screen!: HTMLElement;
    private command!: HTMLElement;
    private nameTag!: HTMLElement;
    private commandItems: HTMLParagraphElement[] = [];
    private selectedIndex = 0;
    private actorName: string = "";
    private enemies: BattleEnemy[] = [];
    private enabled = true;

    private payload!: BasicCommandPayload;

    private emitWorld!: (event: WorldEvent) => void;
    private emitUI!: (event: AppUIEvent) => void;

    private ctx!: ScreenInitContext;
    private battleState!: BattleState;

    constructor() { }

    /**
     * 画面初期化
     */
    init(root: HTMLElement, initCtx: ScreenInitContext) {
        console.log("[BattleBasicCommandOverlay] init");

        this.ctx = initCtx;
        this.emitWorld = this.ctx.emitWorld
        this.emitUI = this.ctx.emitUI;

        // 画面全体
        this.screen = document.createElement("div");
        this.screen.id = "battleBasicCommandOverlay";
        root.appendChild(this.screen);

        // コマンド生成
        this.command = document.createElement("div");
        this.command.classList = "command";
        this.screen.appendChild(this.command);

        // コマンド生成
        BASIC_COMMANDS_DISPLAY.forEach((cmd, index) => {
            const p = document.createElement("p");
            p.textContent = cmd.label;

            this.command.appendChild(p);
            this.commandItems.push(p);
        });

        // ネームタグ生成
        this.nameTag = document.createElement("div");
        this.nameTag.id = "nameTag";
        this.screen.appendChild(this.nameTag);

        this.updateCommandUI();
        this.hide();
    }

    show(payload: BasicCommandPayload) {
        this.payload = payload;
        this.actorName = payload.actorName;
        this.nameTag.textContent = `Actor: ${this.actorName ?? ""}`;

        this.screen.style.display = "block";
    }

    hide() {
        this.screen.style.display = "none";
    }

    update() { }

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
                    this.selectedIndex = (this.selectedIndex - 1 + this.commandItems.length) % this.commandItems.length;
                    audioManager.playSE("assets/se/cursorMove.mp3");
                    break;

                case "DOWN":
                case "RIGHT":
                    this.selectedIndex = (this.selectedIndex + 1) % this.commandItems.length;
                    audioManager.playSE("assets/se/cursorMove.mp3");
                    break;
            }
        }
        this.updateCommandUI();
        return true;
    }

    /**
     * UI Action 入力
     * - CONFIRM : オーバーレイ表示 or コマンド実行
     * - CANCEL  : attack にカーソルを戻す / 前のメンバーへ
     */
    handleUIActions(events: UIActionEvent[]): boolean {

        for (const e of events) {
            switch (e.action) {
                case "CONFIRM": {
                    audioManager.playSE("assets/se/decide.mp3");

                    const commandId = BASIC_COMMANDS_DISPLAY[this.selectedIndex].id;
                    const battleCommandSelectedPayload: CommandSelectedPayload = { phaseBase: this.payload, commandId }

                    switch (commandId) {
                        case CommandActionType.ATTACK: {
                            this.emitUI({ type: "BATTLE_COMMAND_SELECTED", payload: battleCommandSelectedPayload });
                            break;
                        }

                        case CommandActionType.TECHNIQUE: {
                            this.emitUI({ type: "BATTLE_COMMAND_SELECTED", payload: battleCommandSelectedPayload });
                            break;
                        }

                        case CommandActionType.MAGIC: {
                            this.emitUI({ type: "BATTLE_COMMAND_SELECTED", payload: battleCommandSelectedPayload });
                            break;
                        }

                        case CommandActionType.DEFENCE: {
                            this.emitUI({ type: "BATTLE_COMMAND_SELECTED", payload: battleCommandSelectedPayload });
                            break;
                        }

                        case CommandActionType.ITEM: {
                            this.emitUI({ type: "BATTLE_COMMAND_SELECTED", payload: battleCommandSelectedPayload });
                            break;
                        }

                        case CommandActionType.ESCAPE: {
                            this.emitUI({ type: "BATTLE_COMMAND_SELECTED", payload: battleCommandSelectedPayload });
                            break;
                        }
                    }
                    return true;
                }
                case "CANCEL": {
                    return true;
                }
                case "TEST_CHANGE_WORLD":
                    this.emitWorld?.({ type: "BATTLE_RESULT", result: BattleResult.ESCAPE });
                    break;
            }
        }
        return true; // UI入力は常に消費
    }

    private updateCommandUI() {
        this.commandItems.forEach((el, i) => {
            el.classList.toggle("selected", i === this.selectedIndex);
        });
    }

    setBattleState(state: BattleState) {
        this.battleState = state;
        this.render();
    }

    render() {
        // HP表示
        // コマンド表示
        // 敵表示
    }

    /**
     * 攻撃対象をセット
     */
    setEnemies(enemies: BattleEnemy[]) {

    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;

        if (!this.screen) return;

        if (enabled) {
            this.screen.classList.remove("disabled");
        } else {
            this.screen.classList.add("disabled");
        }
    }
}
