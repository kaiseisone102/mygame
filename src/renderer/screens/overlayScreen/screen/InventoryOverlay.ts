// src/renderer/screens/overlayScreen/screen/InventoryOverlay.ts

import { GameState } from "../../../../shared/data/gameState";
import { ItemPresetsById } from "../../../../shared/master/battle/ItemPreset";
import { MaterialPresetsById } from "../../../../shared/master/item/MaterialPreset";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { AppDirection } from "../../../../shared/type/PlayerState";
import { audioManager } from "../../../../renderer/asset/audio/audioManager";
import { CommonAction, InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";

type Tab = "ITEM" | "MATERIAL";
type Mode = "LIST" | "TARGET";

type ItemEntry = { id: string; name: string; count: number; desc: string; usable: boolean };
type MaterialEntry = { id: string; name: string; count: number; desc: string };

/**
 * InventoryOverlay(どうぐ画面)
 *
 * - 不思議のダンジョン風のリスト表示。
 * - 2カテゴリ:「つかえる道具」(消費アイテム) と「マテリアル」(素材・コレクション)。◀▶で切替。
 * - 道具は つかう → 対象の味方を選ぶ → 1個消費(回復系のみフィールドで使用可)。
 *   個数が0になればリストから消える。攻撃系は「戦闘中のみ」。
 * - マテリアルは持っているだけ(スタック表示)。使用不可。
 */
export class InventoryOverlay implements OverlayScreen<void> {
    readonly overlayId: string = OverlayScreenType.INVENTORY;
    readonly capturesInput: boolean = true;

    private emitUI!: (event: AppUIEvent) => void;
    private screen!: HTMLElement;
    private body!: HTMLElement;

    private tab: Tab = "ITEM";
    private mode: Mode = "LIST";
    private listIndex = 0;
    private targetIndex = 0;
    private message = "";

    /** つかう対象として選択中の道具ID(TARGET モード中) */
    private pendingItemId: string | null = null;

    constructor(private gameState: GameState) { }

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.emitUI = initCtx.emitUI;

        this.screen = document.createElement("div");
        this.screen.id = "inventory-overlay";
        this.screen.style.position = "absolute";
        this.screen.style.inset = "0";
        this.screen.style.background = "rgba(0,0,0,0.82)";
        this.screen.style.color = "white";
        this.screen.style.font = "16px/1.6 monospace";
        this.screen.style.padding = "24px";
        this.screen.style.boxSizing = "border-box";
        this.screen.style.whiteSpace = "pre";
        this.screen.style.zIndex = "50";

        this.body = document.createElement("div");
        this.screen.appendChild(this.body);

        root.appendChild(this.screen);
        this.hide();
    }

    show(): void {
        this.tab = "ITEM";
        this.mode = "LIST";
        this.listIndex = 0;
        this.targetIndex = 0;
        this.message = "";
        this.pendingItemId = null;
        this.screen.style.display = "block";
        this.render();
    }

    hide(): void {
        this.screen.style.display = "none";
    }

    update(_delta: number): void { }

    // ===== 入力 =====

    handleUIAxes(axes: InputAxis[]): boolean {
        for (const axis of axes) {
            if (this.mode === "LIST") {
                if (axis === AppDirection.LEFT || axis === AppDirection.RIGHT) {
                    this.tab = this.tab === "ITEM" ? "MATERIAL" : "ITEM";
                    this.listIndex = 0;
                    this.message = "";
                } else if (axis === AppDirection.UP) {
                    this.listIndex = this.clamp(this.listIndex - 1, this.currentList().length);
                } else if (axis === AppDirection.DOWN) {
                    this.listIndex = this.clamp(this.listIndex + 1, this.currentList().length);
                }
            } else {
                if (axis === AppDirection.UP) this.targetIndex = this.clamp(this.targetIndex - 1, this.party.length);
                else if (axis === AppDirection.DOWN) this.targetIndex = this.clamp(this.targetIndex + 1, this.party.length);
            }
        }
        this.render();
        return true;
    }

    handleUIActions(actions: UIActionEvent[]): boolean {
        for (const a of actions) {
            if (a.action === CommonAction.CONFIRM) this.confirm();
            else if (a.action === CommonAction.CANCEL) this.cancel();
            else if (a.action === CommonAction.INVENTORY) this.close();
        }
        return true;
    }

    // ===== 状態取得 =====

    private get party() { return this.gameState.party; }

    private itemEntries(): ItemEntry[] {
        return Object.entries(this.gameState.items)
            .filter(([id, count]) => count > 0 && !!ItemPresetsById[id])
            .map(([id, count]) => {
                const preset = ItemPresetsById[id];
                return {
                    id,
                    name: preset.name,
                    count,
                    desc: preset.description,
                    usable: this.gameState.isFieldUsableItem(id),
                };
            });
    }

    private materialEntries(): MaterialEntry[] {
        return Object.entries(this.gameState.materials)
            .filter(([id, count]) => count > 0 && !!MaterialPresetsById[id])
            .map(([id, count]) => {
                const preset = MaterialPresetsById[id];
                return { id, name: preset.name, count, desc: preset.description };
            });
    }

    private currentList(): { id: string; name: string; count: number; desc: string }[] {
        return this.tab === "ITEM" ? this.itemEntries() : this.materialEntries();
    }

    private clamp(value: number, length: number): number {
        if (length <= 0) return 0;
        return Math.max(0, Math.min(length - 1, value));
    }

    // ===== 決定 / キャンセル =====

    private confirm(): void {
        if (this.mode === "TARGET") {
            this.applyUse();
            return;
        }

        // LIST
        if (this.tab === "MATERIAL") {
            audioManager.playSE("assets/se/cancel.mp3");
            this.message = "マテリアルは集めておくもの。今は使えない。";
            this.render();
            return;
        }

        const entry = this.itemEntries()[this.listIndex];
        if (!entry) return;

        if (!entry.usable) {
            audioManager.playSE("assets/se/cancel.mp3");
            this.message = `${entry.name}は戦闘中にしか使えない。`;
            this.render();
            return;
        }

        // 回復系 → 対象選択へ
        audioManager.playSE("assets/se/decide.mp3");
        this.pendingItemId = entry.id;
        this.targetIndex = 0;
        this.mode = "TARGET";
        this.message = "";
        this.render();
    }

    private applyUse(): void {
        const target = this.party[this.targetIndex];
        if (!this.pendingItemId || !target) {
            this.mode = "LIST";
            this.render();
            return;
        }

        const result = this.gameState.useItemOnAlly(this.pendingItemId, target.instanceId);
        audioManager.playSE(result.ok ? "assets/se/decide.mp3" : "assets/se/cancel.mp3");
        this.message = result.message;

        this.mode = "LIST";
        this.pendingItemId = null;
        // 個数が変わったのでカーソルを補正
        this.listIndex = this.clamp(this.listIndex, this.itemEntries().length);
        this.render();
    }

    private cancel(): void {
        audioManager.playSE("assets/se/cancel.mp3");
        if (this.mode === "TARGET") {
            this.mode = "LIST";
            this.pendingItemId = null;
            this.render();
            return;
        }
        this.close();
    }

    private close(): void {
        this.emitUI({ type: "POP_OVERLAY" });
    }

    // ===== 描画 =====

    private render(): void {
        const cursor = (on: boolean) => (on ? "▶ " : "  ");
        const lines: string[] = [];

        lines.push("=== どうぐ ===", "");

        // タブ
        const itemTab = this.tab === "ITEM" ? "[ つかえる道具 ]" : "  つかえる道具  ";
        const matTab = this.tab === "MATERIAL" ? "[ マテリアル ]" : "  マテリアル  ";
        lines.push(`${itemTab}   ${matTab}      (◀▶ きりかえ)`, "");

        const list = this.currentList();
        if (list.length === 0) {
            lines.push("  (なにも持っていない)");
        } else {
            list.forEach((e, i) => {
                const sel = this.mode === "LIST" && i === this.listIndex;
                const tag = this.tab === "ITEM" && !this.gameState.isFieldUsableItem(e.id) ? "  (戦闘用)" : "";
                const pad = e.name.padEnd(12, "　");
                lines.push(`${cursor(sel)}${pad} ×${e.count}${tag}`);
            });
            // 説明
            const cur = list[this.clamp(this.listIndex, list.length)];
            if (cur) lines.push("", `  ${cur.desc}`);
        }

        // 対象選択
        if (this.mode === "TARGET") {
            lines.push("", "--- だれに使う？ ---");
            this.party.forEach((p, i) => {
                const sel = i === this.targetIndex;
                lines.push(`${cursor(sel)}${p.name}  HP ${p.baseStats.hp}/${p.baseStats.maxHp}`);
            });
        }

        if (this.message) lines.push("", `▶ ${this.message}`);

        lines.push("", this.hint());
        this.body.innerHTML = lines.join("\n");
    }

    private hint(): string {
        if (this.mode === "TARGET") return "↑↓:対象選択  決定:つかう  キャンセル:戻る";
        return "↑↓:選択  ◀▶:カテゴリ  決定:つかう  キャンセル:閉じる";
    }
}
