// src/renderer/screens/battleScene/mainScreen/BattleBackgroundScreen.ts

import { BattleState } from "../../../../renderer/game/battle/core/BattleState";
import { MainScreen } from "../../interface/screen/MainScreen";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { ImageStore } from "../../../../renderer/asset/ImageStore";
import { ImageKey } from "../../../../shared/type/ImageKey";
import { BiomeId } from "../../../../shared/type/battle/enemy/BiomeId";

/**
 * 背景・カメラ・揺れ
 */
export class BattleBackgroundScreen implements MainScreen<BiomeId> {
    private battleState!: BattleState
    private rootEl!: HTMLElement;
    private bgEl!: HTMLDivElement;

    private img!: HTMLImageElement;

    init(root: HTMLElement, ctx: ScreenInitContext): void {
        this.rootEl = root;

        // 背景用の div を作る
        this.bgEl = document.createElement("div");
        this.bgEl.id = "battle-bg";
        root.appendChild(this.bgEl);

        // 初期スタイル
        Object.assign(this.bgEl.style, {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundSize: "cover",       // 画面いっぱいに表示
            backgroundPosition: "center",  // 中央寄せ
            backgroundRepeat: "no-repeat",
            zIndex: "-1",                  // 他UIの下に置く
            filter: "brightness(0.8)",     // 少し暗めにしてUIを目立たせる
        });
    }

    show(payload: BiomeId): void {
        this.bgEl.style.display = "block";

        switch (payload) {
            case BiomeId.PLAIN: this.img = ImageStore.get(ImageKey.BATTLE_BG_PLAIN); break;
            case BiomeId.FOREST: this.img = ImageStore.get(ImageKey.BATTLE_BG_FOREST); break;
            case BiomeId.CAVE: this.img = ImageStore.get(ImageKey.BATTLE_BG_CAVE); break;
            case BiomeId.DEEPER_CAVE: this.img = ImageStore.get(ImageKey.BATTLE_BG_DEEPER_CAVE); break;
            case BiomeId.WATER: this.img = ImageStore.get(ImageKey.BATTLE_BG_WATER); break;
        }

        this.bgEl.innerHTML = ""; // 既存内容をクリア
        this.bgEl.appendChild(this.img);
        Object.assign(this.img.style, {
            width: "100%",
            height: "100%",
            objectFit: "cover",
        });
    }

    hide(): void {
        this.bgEl.style.display = "none";
    }

    handleUIActions(actions: UIActionEvent[]): boolean {
        return true
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        return true
    }

    setBattleState(state: BattleState) {
        this.battleState = state;
    }
}