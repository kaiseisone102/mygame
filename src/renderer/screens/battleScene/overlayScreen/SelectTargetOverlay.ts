// src/renderer/screens/battleScene/overlayScreen/AttackTargetOverlay.ts

import { SkillId, TechniqueId } from "../../../../shared/master/battle/type/SkillPreset";
import { BattleActor } from "../../../../shared/type/battle/BattleAction";
import { CommandActionType } from "../../../../shared/type/battle/TargetType";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { audioManager } from "../../../asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "../../../input/mapping/InputMapper";
import { AppUIEvent } from "../../../router/AppUIEvents";
import { WorldEvent } from "../../../router/WorldEvent";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { SelectTargetOverlayScreen } from "../../interface/overlay/OverLayScreens";

export type SelectTargetPayload = {
    allies: BattleActor[];
    enemies: BattleActor[];
    skillId: SkillId;
    isTargetEnemy: boolean;
};

/**
 * SelectTargetOverlay
 * 
 * 役割:
 * - 攻撃ターゲットの決定,前の画面に戻る(BattelScreen)
 * - 敵の数は1~8(エンカウントパターンによる)
 * - 生存している敵のみ選択
 */
export class SelectTargetOverlay implements SelectTargetOverlayScreen {
    readonly overlayId: string = OverlayScreenType.SELECT_TARGET_OVERLAY;

    readonly capturesInput: true = true;

    private screen!: HTMLElement;
    private target!: HTMLElement;
    private commandItems: HTMLParagraphElement[] = [];
    private selectedIndex = 0;
    private actorMasterId: number = 0;
    private actorInstanceId: number = 0;
    private actorName: string = "";
    private targets: BattleActor[] = [];
    private commandId!: CommandActionType;

    private skillId!: SkillId;
    private targetType?: string;

    private emitWorld!: (event: WorldEvent) => void;
    private emitUI!: (event: AppUIEvent) => void;

    private ctx!: ScreenInitContext;

    constructor() { }

    /**
     * 画面初期化
     */
    init(root: HTMLElement, initCtx: ScreenInitContext) {
        console.log("[AttackTargetOverlay] init");

        this.ctx = initCtx;
        this.emitWorld = this.ctx.emitWorld
        this.emitUI = this.ctx.emitUI;

        // 画面全体
        this.screen = document.createElement("div");
        this.screen.id = "attackTargetOverlay";
        root.appendChild(this.screen);

        this.target = document.createElement("div");
        this.target.className = "targetList";
        this.screen.appendChild(this.target);

        this.buildTargetList();
        this.updateCommandTargetUI();
        this.hide();
    }

    show(payload: SelectTargetPayload) {
        this.selectedIndex = 0;
        this.screen.style.display = "block";
        const targets = payload.isTargetEnemy ? payload.enemies : payload.allies
        this.setTargets(targets); // ターゲットリスト描画
        this.skillId = payload.skillId;
        this.updateCommandTargetUI();
    }

    hide() {
        this.screen.style.display = "none";
    }

    update(delta: number): void {

    }

    pause(): void {
        // this.disableCursorBlink(); いいよね
    }

    resume(): void {

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
        if (this.commandItems.length === 0) return true;

        for (const axis of axes) {

            switch (axis) {
                case "UP":
                case "LEFT":
                    this.selectedIndex = (this.selectedIndex - 1 + this.commandItems.length) % this.commandItems.length;
                    this.updateCommandTargetUI();
                    audioManager.playSE("assets/se/cursorMove.mp3");
                    break;

                case "DOWN":
                case "RIGHT":
                    this.selectedIndex = (this.selectedIndex + 1) % this.commandItems.length;
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

                    const targetEl = this.commandItems[this.selectedIndex];
                    if (!targetEl) {
                        console.warn("No target selected, ignoring CONFIRM");
                        return true;
                    }
                    const enemyId = Number(targetEl.dataset.enemyId);

                    if (enemyId === undefined || isNaN(enemyId)) throw new Error("AttackTargetOverlay require targetEnemyId")

                    this.emitUI({
                        type: "PLAYER_COMMAND_SELECTED",
                        input: {
                            skillId: this.skillId ?? TechniqueId.ATTACK,
                            targetId: enemyId
                        }
                    });
                    break;
                }
                case "CANCEL":
                    this.emitUI?.({ type: "POP_OVERLAY" });
                    break;
            }
        }
        return true;
    }

    private buildTargetList() {
        this.target.innerHTML = "";
        this.commandItems = [];

        const aliveTargets = this.targets.filter(t => t.alive);

        aliveTargets.forEach(target => {
            const p = document.createElement("p");
            p.textContent = target.name;
            p.dataset.enemyId = String(target.instanceId);

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

    /**
     * 攻撃対象をセット
     */
    setTargets(targets: BattleActor[]) {
        this.targets = targets;
        this.buildTargetList();
    }
}
