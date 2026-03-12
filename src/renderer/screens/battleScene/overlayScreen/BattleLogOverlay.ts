// src/renderer/screens/battleScreen/overlayScreen//BattleLogOverlay.ts

import { BattleState } from "../../../../renderer/game/battle/core/BattleState";
import { ExpLog } from "../../../../renderer/game/battle/service/BattleResultService";
import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { OverlayScreen } from "../../interface/overlay/OverLayScreens";
import { BattleEnemy } from "./AttackTargetOverlay";
import { BattleLogOverlayController } from "./controller/BattleLogOverlayController";

/**
 * BattleLogOverlay
 *
 * 役割:
 * - バトルログ画面(UIオーバーレイ)を表示する
 * - UIAction を受け取り UI 操作に変換する
 *
 * 入力仕様:
 * - CONFIRM / CANCEL / INVENTORY → メッセージ送りはしない
 *
 * 備考:
 * - Game入力は一切扱わない
 * - capturesInput = false により、背後の画面への入力を遮断しない
 */
export class BattleLogOverlay implements OverlayScreen {
    readonly overlayId: string = OverlayScreenType.BATTLE_LOG;
    /** この画面が入力をキャプチャするか */
    readonly capturesInput: boolean = false;

    private controller!: BattleLogOverlayController;

    private battleState!: BattleState;

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.controller = new BattleLogOverlayController();
        this.controller.init(root, initCtx);
        this.hide();
        console.log("[BattleLogOverlay] done init")
    }

    show(): void {
        this.controller.show();
    }

    hide(): void {
        console.log("BattleLogOverlay hide");
        this.controller.hide();
    }

    update(delta: number): void {
        this.controller.update(delta);
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        this.controller.UIAxis(axes);
        return true;
    }

    handleUIActions(events: UIActionEvent[]): boolean {
        this.controller.UIActions(events);
        return true
    }

    setBattleState(state: BattleState) {
        this.battleState = state;
    }

    /** display message */
    addLog(message: string) {
        this.controller.addLog(message)
    }

    /** addLog (with EXP) */
    public async playExpLogs(expLogs: ExpLog[]) {
        await this.controller.playExpLogs(expLogs);
    }
    setEnemies(enemies: BattleEnemy[]) {
    }
}
