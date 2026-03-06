// src/renderer/screens/battleScene/mainScreen/BattleEnemyScreen.ts

import { BattleState } from "../../../../renderer/game/battle/core/BattleState";
import { EnemyView } from "../view/EnemyView";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { DamagePopupView } from "../view/DamagePopupView ";
import { ScreenInitContext } from "../../interface/context/ScreenInitContext";
import { BattleEventKind } from "../../../../renderer/game/battle/event/BattleEvent";
import { MainScreen } from "../../interface/screen/MainScreen";
import { InputFrame } from "../../../../renderer/input/frame/InputFrame";
import { InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { AllyView } from "../view/AllyView";

/**
 * 敵の表示・演出
 * 
 * [責務]
 * - 敵の表示・非表示
 * - 生死による表示切替
 * - ダメージ・点滅・揺れ
 * - 状態異常アイコン
 * - 攻撃対象のハイライト
 *
 * [保証しない]
 * - ダメージ計算
 * - 生死判定
 * - コマンド入力
 */
export class BattleEnemyScreen implements MainScreen {
    private root!: HTMLElement;
    private screen!: HTMLElement;
    private enemyZone!: HTMLElement;
    private enemyContainer!: HTMLElement;
    private allyZone!: HTMLElement;
    private allyContainer!: HTMLElement;

    private battleState!: BattleState;

    private enemyViews = new Map<number, EnemyView>();
    private allyViews = new Map<number, AllyView>();

    init(root: HTMLElement, ctx: ScreenInitContext): void {
        this.root = root;

        // ===== ルート =====
        this.screen = document.createElement("div");
        this.screen.id = "battleEnemyScreen";

        // ===== 敵ゾーン（上40%）=====
        this.enemyZone = document.createElement("div");
        this.enemyZone.className = "enemy-zone";

        // ===== 敵コンテナ =====
        this.enemyContainer = document.createElement("div");
        this.enemyContainer.className = "battle-enemy-container";

        // ===== 味方ゾーン =====
        this.allyZone = document.createElement("div");
        this.allyZone.className = "ally-zone";

        this.allyContainer = document.createElement("div");
        this.allyContainer.className = "battle-ally-container";

        this.enemyZone.appendChild(this.enemyContainer);

        this.allyZone.appendChild(this.allyContainer);

        this.screen.appendChild(this.enemyZone);
        this.screen.appendChild(this.allyZone);

        this.root.appendChild(this.screen);
    }

    show(): void {
        this.screen.style.display = "block";
    }

    hide(): void {
        this.screen.style.display = "none";
    }

    update(delta: number, frame: InputFrame): void { }

    handleUIActions(actions: UIActionEvent[]): boolean {
        return true;
    }

    handleUIAxes(axes: InputAxis[]): boolean {
        return true;
    }

    // 描画は state の結果に従うだけにする
    setBattleState(state: BattleState) {
        this.battleState = state;
        this.syncEnemies();
        this.syncAllies(); 
    }

    private syncEnemies() {
        for (const enemy of this.battleState.enemies) {

            let view = this.enemyViews.get(enemy.id);

            // まだ表示していない敵は生成
            if (!view) {
                view = new EnemyView(enemy.id, enemy.name, this.enemyContainer);
                this.enemyViews.set(enemy.id, view);
            }

            // 生死同期
            enemy.alive ? view.show() : view.fadeOut();
            this.layoutEnemies();
        }
    }

    private syncAllies() {
        for (const ally of this.battleState.allies) {

            let view = this.allyViews.get(ally.id);

            if (!view) {
                view = new AllyView(ally.id, ally.name, this.allyContainer);
                this.allyViews.set(ally.id, view);
            }

            ally.alive ? view.show() : view.fadeOut();
        }
    }

    // 演出イベントだけ処理
    handleUIEvent(event: AppUIEvent) {
        if (event.type !== "BATTLE_EVENT") return;

        const e = event.event;

        switch (e.type) {
            case BattleEventKind.DAMAGE:
                this.showDamage(e.targetId, e.value, e.isCritical);
                break;

            case BattleEventKind.HEAL:
                this.showHeal(e.targetId, e.value);
                break;

            case BattleEventKind.DEAD:
                this.onKilled(e.targetId);
                break;
        }
    }

    private showDamage(targetId: number, value: number, critical: boolean) {
        const view = this.enemyViews.get(targetId);
        if (!view) return;

        const pos = view.getCenterPosition();
        new DamagePopupView(this.root, pos.x, pos.y, value, critical);

        //     view.shake?.();
        //     view.flash?.();
    }

    private showHeal(targetId: number, value: number) {
        const enemyView = this.enemyViews.get(targetId);
        if (!enemyView) return;

        const pos = enemyView.getCenterPosition();
        new DamagePopupView(this.root, pos.x, pos.y, value, false, BattleEventKind.HEAL);
    }

    private onKilled(targetId: number) {
        this.enemyViews.get(targetId)?.fadeOut();
    }

    private layoutEnemies() {
        const views = [...this.enemyViews.values()];

        views.forEach((view, i) => {
            const depth = 1 - i * 0.05;
            view.element.style.transform = `scale(${depth})`;
        });
    }

}