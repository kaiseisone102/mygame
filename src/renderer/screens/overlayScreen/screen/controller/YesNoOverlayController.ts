// src/renderer/screens/overlayScreens/screen/controller/YesNoOverlayController.ts

import { InputAxis, UIActionEvent } from "../../../../../renderer/input/mapping/InputMapper";
import { ScreenInitContext } from "../../../../../renderer/screens/interface/context/ScreenInitContext";
import { YesNoEvent } from "../../../../../shared/events/ui/YesNoEvent";

export class YesNoOverlayController implements YesNoOverlayController {
    private screen!: HTMLElement;
    private ctx!: ScreenInitContext;

    private onYes!: () => void;
    private onNo?: () => void;

    private selectedIndex = 0;
    private choices!: HTMLElement[];
    private messageEl!: HTMLElement;

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.ctx = initCtx;

        // ルート
        this.screen = document.createElement("div");
        this.screen.id = "yesNoOverlay";

        // --------------------
        // window
        // --------------------
        const windowEl = document.createElement("div");
        windowEl.className = "yesno-window";

        // --------------------
        // message
        // --------------------
        this.messageEl = document.createElement("div");
        this.messageEl.className = "yesno-message";

        // --------------------
        // choices
        // --------------------
        const ul = document.createElement("ul");
        ul.className = "yesno-choices";

        const yesChoice = this.createChoice("はい", "yes", true);
        const noChoice = this.createChoice("いいえ", "no", false);

        ul.appendChild(yesChoice);
        ul.appendChild(noChoice);

        // 組み立て
        windowEl.appendChild(this.messageEl);
        windowEl.appendChild(ul);
        this.screen.appendChild(windowEl);
        root.appendChild(this.screen);

        this.choices = [yesChoice, noChoice];

        this.updateSelection();
    }

    show(event: YesNoEvent): void {
        this.messageEl.textContent = event.message;
        this.onYes = event.onYes;
        this.onNo = event.onNo;

        this.selectedIndex = 0;
        this.updateSelection();

        this.screen.style.display = "block";
    }

    hide(): void {
        this.screen.style.display = "none";
    }

    update(delta: number): void {

    }

    UIAxes(axes: InputAxis[]): void {
        for (const axis of axes) {

            switch (axis) {
                case "UP":
                case "RIGHT":
                    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                    this.updateSelection();
                    break;

                case "DOWN":
                case "LEFT":
                    this.selectedIndex = Math.min(
                        this.choices.length - 1,
                        this.selectedIndex + 1
                    );
                    this.updateSelection();
                    break;

            }
        }
    }

    UIActions(events: UIActionEvent[]) {
        for (const e of events) {
            if (e.action === "CONFIRM") {
                if (this.selectedIndex === 0) {
                    this.onYes();
                } else {
                    this.onNo?.();
                }
            }
            if (e.action === "CANCEL") {
                this.onNo?.();
            }
        }
    }

    private updateSelection() {
        this.choices.forEach((el, i) => {
            el.classList.toggle("selected", i === this.selectedIndex);
        });
    }

    private createChoice(
        label: string,
        value: string,
        selected: boolean
    ): HTMLElement {
        const li = document.createElement("li");
        li.className = "choice";
        li.dataset.value = value;

        if (selected) {
            li.classList.add("selected");
        }

        const cursor = document.createElement("span");
        cursor.className = "cursor";

        const text = document.createTextNode(` ${label}`);

        li.appendChild(cursor);
        li.appendChild(text);

        return li;
    }

}
