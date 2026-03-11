// src/renderer/screens/battleScreens/overlayScreen/controller/BattleLogOverlayController.ts

import { ExpLog } from "../../../../../renderer/game/battle/service/BattleResultService";
import { InputAxis, UIActionEvent } from "../../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { ScreenInitContext } from "../../../../../renderer/screens/interface/context/ScreenInitContext";
import { UIScreenController } from "../../../../../renderer/screens/interface/controller/UIScreenController";
import { BATTLE_LOG_TYPE_SPEED } from "../../../../../shared/data/constants";

type BaseLogQueueItem =
    | { type: "string"; message: string; speed: number }
    | { type: "exp"; message: string; currentExp: number; requiredExp: number; oldExp: number; speed: number };

// 内部キュー用に resolve を追加
type QueueItem = BaseLogQueueItem & { resolve: () => void };

export class BattleLogOverlayController implements UIScreenController {
    private screen!: HTMLElement;
    private logContainer!: HTMLElement;
    private emitUI?: (event: AppUIEvent) => void;
    private ctx!: ScreenInitContext;

    /** 履歴ログ */
    private logs: string[] = [];
    /** 表示キュー */
    private logQueue: QueueItem[] = [];
    /** タイピング管理 */
    private isTyping = false;

    init(root: HTMLElement, initCtx: ScreenInitContext): void {

        this.ctx = initCtx;
        this.emitUI = this.ctx.emitUI;

        // --------------------
        // 外枠
        // --------------------
        this.screen = document.createElement("div");
        this.screen.id = "battleLogOverlay";

        // --------------------
        // ログ表示領域
        // --------------------
        this.logContainer = document.createElement("div");
        this.logContainer.id = "battleLogContainer";

        this.screen.appendChild(this.logContainer);
        root.appendChild(this.screen);
    }

    show(): void {
        this.screen.style.display = "block";
    }

    hide(): void {
        this.clearLogs();
        this.screen.style.display = "none";
    }

    update(delta: number): void { }

    UIAxis(axes: InputAxis[]): void { }

    UIActions(events: UIActionEvent[]): void { }

    /** ログ追加（文字） */
    addLog(message: string, speed = BATTLE_LOG_TYPE_SPEED): Promise<void> {
        console.log("[BattleLog]", message);
        return this.enqueueLog({ type: "string", message, speed });
    }

    /** addLog (with EXP) */
    async playExpLogs(expLogs: ExpLog[], speed = BATTLE_LOG_TYPE_SPEED): Promise<void> {

        for (const log of expLogs) {

            const message = `${log.name}(${log.oldExp}) gained ${log.gainedExp} EXP! ${log.newExp}/${log.expRequired}]`;

            await this.enqueueLog({
                type: "exp",
                message,
                oldExp: log.oldExp,
                currentExp: log.newExp,
                requiredExp: log.expRequired,
                speed
            });

        }
    }

    /** キューに登録して順番に処理 */
    private async enqueueLog(item: BaseLogQueueItem): Promise<void> {
        return new Promise<void>((resolve) => {
            this.logQueue.push({ ...item, resolve });
            void this.processQueue(); // ← 常に呼ぶ
        });
    };

    /** キュー処理 */
    private async processQueue() {
        if (this.isTyping) return;

        this.isTyping = true;

        while (this.logQueue.length > 0) {
            const item = this.logQueue.shift()!;

            if (item.type === "string") {
                await this.typeMessage(item);
            } else if (item.type === "exp") {
                await this.typeMessageWithExp(item);
            }
            item.resolve();
            await new Promise(requestAnimationFrame);
        }
        this.isTyping = false;
    }

    /** 文字ログをタイピング */
    private typeMessage(item: { message: string; speed: number }): Promise<void> {
        return new Promise(resolve => {

            const block = document.createElement("div");
            block.className = "logBlock";

            const p = document.createElement("p");
            p.style.margin = "2px 0";

            block.appendChild(p);
            this.logContainer.appendChild(block);

            this.limitLogLines();

            let index = 0;

            const interval = window.setInterval(() => {
                if (index >= item.message.length) {
                    clearInterval(interval);
                    resolve(); // bring finished call typing-process
                    return;
                }

                p.textContent += item.message[index];
                index++;

            }, item.speed);
        });
    }

    /** EXPログ + バーを same block タイピング */
    private typeMessageWithExp(item: { message: string; speed: number; currentExp: number; requiredExp: number; oldExp: number; }): Promise<void> {
        return new Promise(resolve => {

            const block = document.createElement("div");
            block.className = "logBlock";

            const p = document.createElement("p");
            p.style.margin = "2px 0";

            const barContainer = document.createElement("div");
            barContainer.className = "expBarContainer";

            const barFill = document.createElement("div");
            barFill.className = "expBarFill";

            barContainer.appendChild(barFill);

            block.appendChild(p);
            block.appendChild(barContainer);

            this.logContainer.appendChild(block);

            this.limitLogLines();

            let index = 0;

            const interval = window.setInterval(() => {

                if (index >= item.message.length) {

                    clearInterval(interval);

                    const startRatio = item.oldExp / item.requiredExp;
                    const endRatio = Math.min(item.currentExp / item.requiredExp, 1);

                    this.animateExpBar(barFill, startRatio, endRatio, 800);

                    resolve();
                    return;
                }

                p.textContent += item.message[index];
                index++;

            }, item.speed);
        });
    }

    /** type message and EXP-bar on another block */
    private typeMessageAndExp(item: { message: string; speed: number; currentExp: number; requiredExp: number; oldExp: number; }): Promise<void> {
        return new Promise(async resolve => {

            // ------------------------------
            // 1. メッセージ部分（文字ログブロック）
            // ------------------------------
            await this.typeMessage({ message: item.message, speed: item.speed });

            // ------------------------------
            // 2. EXPバー部分（別ブロック）
            // ------------------------------
            const block = document.createElement("div");
            block.className = "logBlock";

            const barContainer = document.createElement("div");
            barContainer.className = "expBarContainer";

            const barFill = document.createElement("div");
            barFill.className = "expBarFill";

            barContainer.appendChild(barFill);
            block.appendChild(barContainer);
            this.logContainer.appendChild(block);

            this.limitLogLines();

            // アニメーション
            const startRatio = item.oldExp / item.requiredExp;
            const endRatio = Math.min(item.currentExp / item.requiredExp, 1);
            this.animateExpBar(barFill, startRatio, endRatio, 800);

            resolve();
        });
    }

    /** log has limit 4-lines　*/
    private limitLogLines() {

        const blocks = Array.from(this.logContainer.querySelectorAll(".logBlock"));

        while (blocks.length > 4) {
            const block = blocks.shift()!;
            if (block.parentElement === this.logContainer) {
                this.logContainer.removeChild(block);
            }
        }
    }

    animateExpBar(bar: HTMLElement, startRatio: number, endRatio: number, duration = 500) {
        const startTime = performance.now();

        function step(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentRatio = startRatio + (endRatio - startRatio) * progress;
            bar.style.width = `${currentRatio * 100}%`;

            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    /**
     * ログクリア
     */
    clearLogs() {
        this.logQueue = [];
        this.isTyping = false;
        this.logContainer.innerHTML = "";
    }
}