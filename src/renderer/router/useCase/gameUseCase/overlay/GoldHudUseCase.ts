// src/renderer/screens/hud/GoldHud.ts

import { OverlayScreenType } from "../../../../../shared/type/screenType";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { GameState } from "../../../../../shared/data/gameState";
import { ScreenPort } from "../../../../../renderer/port/ScreenPort";

/**
 * GoldHud
 *
 * オーバーレイスタックから独立した所持金表示。
 * - root 直下に固定配置(position: fixed / 左上)
 * - 入力は一切奪わない(pointer-events: none)
 * - 表示/非表示と金額は ScreenManager が毎フレーム render() で制御する
 *
 * スタックに積まないので、どのオーバーレイが上に来ても影響を受けない。
 */
export class GoldHudUseCase {
    private currentGold: number = 0;

    constructor(
        private gameState: GameState,
        private emitUI: (e: AppUIEvent) => void,
        private screens: ScreenPort
    ) { }

    getGold(): number {
        return this.gameState.getSyncGold();
    }

    /**
     * 表示/非表示を切り替える(フィールドコマンド/ショップの開閉時に呼ぶ)。
     * 非表示→表示になった瞬間に金額も最新化する。
     */
    show(): void {
        const refreshGold = this.gameState.getSyncGold();
        this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.GoldHud, payload: { currentGold: refreshGold } });
    }

    /**
     * gameState から現在の所持金を読み直して表示を更新する(gold 変動時に呼ぶ)。
     * すでに表示中の GoldHud オーバーレイの金額だけを直接更新する(再 push しない)。
     */
    refresh(): void {
        this.screens.getOverlayScreen(OverlayScreenType.GoldHud)
            .show({ currentGold: this.gameState.getSyncGold() });
    }
}
