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

        // 1. メインコンテナ（画面下部の大きなエリア）
        this.screen = document.createElement("div");
        this.screen.className = "p5-msg-overlay";
        this.screen.style.display = "none"; // 初期は非表示

        // 2. 背景の黒い帯（斜めにカットされた長い板）
        const bgBar = document.createElement("div");
        bgBar.className = "p5-msg-bg-bar";
        this.screen.appendChild(bgBar);

        // 3. メッセージ本文のコンテナ（少し浮かせる）
        const contentInner = document.createElement("div");
        contentInner.className = "p5-msg-content";

        // 4. キャラクター名ラベル（左上に突き刺さるようなタグ）
        // payloadに名前がない場合を想定して、構造だけ作っておく
        const nameLabel = document.createElement("div");
        nameLabel.className = "p5-msg-name-tag";
        nameLabel.innerText = "SYSTEM"; // デフォルト
        contentInner.appendChild(nameLabel);

        // 5. テキスト表示エリア
        this.logBox = document.createElement("div");
        this.logBox.className = "p5-msg-logbox";
        contentInner.appendChild(this.logBox);

        // 6. 次へ促すアイコン（右下で点滅するひし形など）
        const nextCursor = document.createElement("div");
        nextCursor.className = "p5-msg-next-cursor";
        contentInner.appendChild(nextCursor);

        this.screen.appendChild(contentInner);
        root.appendChild(this.screen);
    }

    show(payload: MessageLogEvent): Promise<void> {
        const nameTag = this.screen.querySelector(".p5-msg-name-tag") as HTMLElement;
        if (nameTag) {
            nameTag.innerText = (payload as any).name || "SYSTEM";
        }
        return this.showMessages(payload.messages);
    }

    hide(): void {
        this.screen.style.display = "none";
    }

    update(delta: number): void { }

    /**
     * Axis 操作処理
     */
    UIAxes(axes: InputAxis[]): void {
        for (const axis of axes) {
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
            this.logBox.innerHTML = ""; // 一旦消して
            // 全文を一気にスパン化して表示
            this.messages[this.currentMessageIndex].split("").forEach(char => {
                const span = document.createElement("span");
                span.textContent = char;
                span.className = "p5-msg-char";
                span.style.display = "inline-block";
                this.logBox.appendChild(span);
            });
            this.typing = false;
            return;
        }

        this.currentMessageIndex++;
        if (this.currentMessageIndex < this.messages.length) {
            this.typeMessage(this.messages[this.currentMessageIndex]);
        } else {
            this.hide();
            this.resolveCurrent?.();
            this.emitUI({ type: "POP_OVERLAY" });
        }
    }

    /**
     * 1メッセージをタイプライター表示
     */
    private typeMessage(text: string): void {
        clearInterval(this.interval);

        this.typing = true;
        this.logBox.innerHTML = "";// 初期化
        let i = 0;

        this.interval = setInterval(() => {
            if (text[i]) {
                const span = document.createElement("span");
                span.textContent = text[i];
                span.className = "p5-msg-char"; // 1文字ずつにクラスを付与

                // P5っぽく、わずかに文字をランダムに傾ける
                const rot = (Math.random() - 0.5) * 4;
                span.style.display = "inline-block";
                span.style.transform = `rotate(${rot}deg)`;

                this.logBox.appendChild(span);
            }
            i++;
            if (i >= text.length) {
                clearInterval(this.interval);
                this.typing = false;
            }
        }, 50);
    }
}
