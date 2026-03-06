// src/renderer/screens/overlayScreen/screen/controller/MessageLogOverlayController.ts

import { audioManager } from "../../../../../renderer/asset/audio/audioManager";
import { InputAxis, UIActionEvent } from "../../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { ScreenInitContext } from "../../../../../renderer/screens/interface/context/ScreenInitContext";
import { MessageLogEvent } from "../MessageLogOverlay";

export class MessageLogOverlayController {
    private screen!: HTMLElement;
    private logBox!: HTMLElement;
    private emitUI!: (event: AppUIEvent) => void;
    private ctx!: ScreenInitContext;

    private resolveCurrent?: () => void;
    private typing = false;
    private interval!: ReturnType<typeof setInterval>;
    private currentMessageIndex = 0;
    private messages: string[] = [];

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.ctx = initCtx;
        this.emitUI = this.ctx.emitUI;

        // --------------------
        // DOM構築
        // --------------------
        this.screen = document.createElement("div");
        this.screen.className = "messageLogOverlay";
        this.screen.style.display = "none";
        this.screen.style.position = "absolute";
        this.screen.style.bottom = "10px";
        this.screen.style.left = "50%";
        this.screen.style.transform = "translateX(-50%)";
        this.screen.style.width = "400px";
        this.screen.style.minHeight = "100px";
        this.screen.style.padding = "10px";
        this.screen.style.background = "rgba(0,0,0,0.7)";
        this.screen.style.color = "white";
        this.screen.style.fontFamily = "monospace";
        this.screen.style.fontSize = "16px";
        this.screen.style.borderRadius = "8px";
        this.screen.style.zIndex = "1000";

        this.logBox = document.createElement("div");
        this.screen.appendChild(this.logBox);

        const hint = document.createElement("div");
        hint.innerText = "[ENTER] 送る";
        hint.style.textAlign = "right";
        hint.style.fontSize = "12px";
        hint.style.opacity = "0.7";
        this.screen.appendChild(hint);

        root.appendChild(this.screen);
    }

    show(payload: MessageLogEvent): Promise<void> {
        return this.showMessages(payload.messages);
    }

    hide(): void {
        this.screen.style.display = "none";
    }

    update(delta: number): void {
        // 特に毎フレームの更新はなし
    }

    /**
     * Axis 操作処理
     */
    UIAxes(axes: InputAxis[]): void {
        for (const axis of axes) {
            // switch (axis) {
            //     case "UP":
            //     case "DOWN":
            //     case "LEFT":
            //     case "RIGHT":
            //         // 方向キーでメッセージ送りもできるようにするならここ
            //         this.nextMessage();
            //         break;
            // }
            // audioManager.playSE("assets/se/cursorMove.mp3");
        }
    }

    UIActions(events: UIActionEvent[]): void {
        for (const e of events) {
            switch (e.action) {
                case "CONFIRM":
                case "CANCEL":
                    this.nextMessage();
                    break;
            }
            audioManager.playSE("assets/se/cursorMove.mp3");
        }
    }

    /**
     * メッセージを順に表示する
     */
    private showMessages(messages: string[]): Promise<void> {
        return new Promise((resolve) => {
            this.messages = messages;
            this.currentMessageIndex = 0;
            this.resolveCurrent = resolve;

            this.screen.style.display = "block";
            this.typeMessage(this.messages[this.currentMessageIndex]);
        });
    }

    /**
     * 次のメッセージに進む
     */
    private nextMessage(): void {
        if (this.typing) {
            // タイピング中は全文表示
            clearInterval(this.interval);
            this.logBox.innerHTML = this.messages[this.currentMessageIndex];
            this.typing = false;
            return;
        }

        this.currentMessageIndex++;
        if (this.currentMessageIndex < this.messages.length) {
            this.typeMessage(this.messages[this.currentMessageIndex]);
        } else {
            this.hide();
            this.emitUI({ type: "POP_OVERLAY" });
            this.resolveCurrent?.();
        }
    }

    /**
     * 1メッセージをタイプライター表示
     */
    private typeMessage(text: string): void {
        this.typing = true;
        this.logBox.innerHTML = "";
        let i = 0;

        this.interval = setInterval(() => {
            this.logBox.innerHTML += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(this.interval);
                this.typing = false;
            }
        }, 50);
    }
}
