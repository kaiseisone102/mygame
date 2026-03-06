// src/renderer/screens/battleScene/mainScreen/BattleBackgroundScreen.ts

import { BattleState } from "@/renderer/game/battle/core/BattleState";
import { MainScreen } from "../../interface/screen/MainScreen";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { InputAxis, UIActionEvent } from "@/renderer/input/mapping/InputMapper";

/**
 * 背景・カメラ・揺れ
 */
export class BattleBackgroundScreen implements MainScreen {
    private battleState!: BattleState

    init(root: HTMLElement, ctx: ScreenInitContext): void {

    }

    show(): void {

    }

    hide(): void {

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