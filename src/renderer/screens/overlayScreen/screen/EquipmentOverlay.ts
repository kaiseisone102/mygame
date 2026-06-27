// src/renderer/screens/overlayScreen/screen/EquipmentOverlay.ts

import { GameState } from "../../../../shared/data/gameState";
import { BaseStats } from "../../../../shared/data/playerConstants";
import { EQUIP_SLOT_LABEL, EQUIP_SLOT_ORDER, EquipmentMap } from "../../../../shared/type/equipment/EquipSlot";
import { JOB_LABEL } from "../../../../shared/type/job/JobId";
import {
    canEquipByJob,
    finalStatsOf as computeFinalStats,
    getEquipmentById,
} from "../../../../shared/master/battle/EquipmentPreset";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { AppDirection } from "../../../../shared/type/PlayerState";
import { audioManager } from "../../../../renderer/asset/audio/audioManager";
import { CommonAction, InputAxis, UIActionEvent } from "../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../renderer/router/AppUIEvents";
import { ScreenInitContext } from "../../../../renderer/screens/interface/context/ScreenInitContext";
import { OverlayScreen } from "../../../../renderer/screens/interface/overlay/OverLayScreens";

type Mode = "MEMBER" | "SLOT" | "PICK";

/**
 * EquipmentOverlay
 * フィールドの「そうび」メニュー。
 *
 * 操作: キャラ選択 → スロット選択 → 装備候補選択(着ける / はずす)。
 * ステータスは常に「装備込み」で表示し、候補にカーソルを合わせると着け替え差分も出す。
 *
 * GameState を直接受け取り、equip()/unequip() を呼んで状態を更新する(ShopOverlay と同じ流儀)。
 */
export class EquipmentOverlay implements OverlayScreen<void> {
    readonly overlayId: string = OverlayScreenType.EQUIPMENT;
    readonly capturesInput: boolean = true;

    /** 「はずす」を表す擬似候補ID */
    private static readonly UNEQUIP = "__UNEQUIP__";

    private emitUI!: (event: AppUIEvent) => void;
    private screen!: HTMLElement;
    private body!: HTMLElement;

    private mode: Mode = "MEMBER";
    private memberIndex = 0;
    private slotIndex = 0;
    private pickIndex = 0;
    private candidates: string[] = [];

    constructor(private gameState: GameState) { }

    init(root: HTMLElement, initCtx: ScreenInitContext): void {
        this.emitUI = initCtx.emitUI;

        this.screen = document.createElement("div");
        this.screen.id = "equipment-overlay";
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
        this.mode = "MEMBER";
        this.memberIndex = 0;
        this.slotIndex = 0;
        this.pickIndex = 0;
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
            if (axis === AppDirection.UP) this.move(-1);
            else if (axis === AppDirection.DOWN) this.move(1);
        }
        return true;
    }

    handleUIActions(actions: UIActionEvent[]): boolean {
        for (const a of actions) {
            if (a.action === CommonAction.CONFIRM) this.confirm();
            else if (a.action === CommonAction.CANCEL || a.action === CommonAction.INVENTORY) this.cancel();
        }
        return true;
    }

    // ===== 便利アクセサ =====

    private get party() { return this.gameState.party; }
    private get member() { return this.party[this.memberIndex]; }
    private get slot() { return EQUIP_SLOT_ORDER[this.slotIndex]; }

    // ===== カーソル移動 =====

    private move(delta: number): void {
        if (this.mode === "MEMBER") {
            this.memberIndex = this.clamp(this.memberIndex + delta, this.party.length);
        } else if (this.mode === "SLOT") {
            this.slotIndex = this.clamp(this.slotIndex + delta, EQUIP_SLOT_ORDER.length);
        } else {
            if (this.candidates.length > 0) {
                this.pickIndex = this.clamp(this.pickIndex + delta, this.candidates.length);
            }
        }
        this.render();
    }

    private clamp(value: number, length: number): number {
        if (length <= 0) return 0;
        return Math.max(0, Math.min(length - 1, value));
    }

    // ===== 決定 / キャンセル =====

    private confirm(): void {
        if (this.mode === "MEMBER") {
            audioManager.playSE("assets/se/decide.mp3");
            this.mode = "SLOT";
            this.slotIndex = 0;
        } else if (this.mode === "SLOT") {
            this.candidates = this.buildCandidates();
            if (this.candidates.length === 0) {
                // 着けられる物も外す物も無い → 何もしない
                audioManager.playSE("assets/se/cancel.mp3");
                return;
            }
            audioManager.playSE("assets/se/decide.mp3");
            this.pickIndex = 0;
            this.mode = "PICK";
        } else {
            audioManager.playSE("assets/se/decide.mp3");
            this.applyPick();
            this.mode = "SLOT";
        }
        this.render();
    }

    private cancel(): void {
        audioManager.playSE("assets/se/cancel.mp3");
        if (this.mode === "PICK") {
            this.mode = "SLOT";
            this.render();
            return;
        }
        if (this.mode === "SLOT") {
            this.mode = "MEMBER";
            this.render();
            return;
        }
        // MEMBER でキャンセル → そうび画面を閉じてフィールドコマンドへ戻る
        this.emitUI({ type: "POP_OVERLAY" });
    }

    private applyPick(): void {
        const choice = this.candidates[this.pickIndex];
        if (!choice) return;

        if (choice === EquipmentOverlay.UNEQUIP) {
            this.gameState.unequip(this.member.instanceId, this.slot);
        } else {
            this.gameState.equip(this.member.instanceId, choice);
        }
    }

    /** 選択中キャラ・スロットに対する装備候補(先頭に「はずす」、続いて在庫から該当slot×職OK) */
    private buildCandidates(): string[] {
        const member = this.member;
        const slot = this.slot;
        const list: string[] = [];

        if (member.equipment[slot]) list.push(EquipmentOverlay.UNEQUIP);

        for (const [equipId, count] of Object.entries(this.gameState.equipment)) {
            if (count <= 0) continue;
            const preset = getEquipmentById(equipId);
            if (!preset) continue;
            if (preset.slot !== slot) continue;
            if (!canEquipByJob(preset, member.job)) continue;
            list.push(equipId);
        }
        return list;
    }

    // ===== 描画 =====

    private render(): void {
        const member = this.member;
        if (!member) { this.body.innerHTML = "(パーティがいません)"; return; }

        const cursor = (on: boolean) => (on ? "▶ " : "  ");
        const lines: string[] = [];

        lines.push("=== そうび ===", "");

        // --- メンバー一覧 ---
        this.party.forEach((p, i) => {
            const sel = this.mode === "MEMBER" && i === this.memberIndex;
            lines.push(`${cursor(sel)}${p.name}  (${JOB_LABEL[p.job] ?? p.job})  Lv${p.level}`);
        });
        lines.push("");

        // --- スロット ---
        lines.push(`--- ${member.name} のそうび ---`);
        EQUIP_SLOT_ORDER.forEach((slot, i) => {
            const onSlot = (this.mode === "SLOT" || this.mode === "PICK") && i === this.slotIndex;
            const id = member.equipment[slot];
            const name = id ? (getEquipmentById(id)?.name ?? id) : "なし";
            lines.push(`${cursor(onSlot && this.mode === "SLOT")}${EQUIP_SLOT_LABEL[slot]}: ${name}`);
        });
        lines.push("");

        // --- ステータス(装備込み / PICK時は差分) ---
        const now = computeFinalStats(member.baseStats, member.equipment);
        const next = this.mode === "PICK" ? this.previewStats() : undefined;
        lines.push("--- ステータス(装備込み) ---");
        lines.push(this.statRow("さいだいHP", now.maxHp, next?.maxHp));
        lines.push(this.statRow("さいだいMP", now.maxMp, next?.maxMp));
        lines.push(this.statRow("こうげき　", now.attack, next?.attack));
        lines.push(this.statRow("ぼうぎょ　", now.defense, next?.defense));
        lines.push(this.statRow("まりょく　", now.magic, next?.magic));
        lines.push(this.statRow("すばやさ　", now.speed, next?.speed));

        // --- 装備候補(PICK時のみ) ---
        if (this.mode === "PICK") {
            lines.push("", `--- ${EQUIP_SLOT_LABEL[this.slot]} の候補 ---`);
            if (this.candidates.length === 0) {
                lines.push("  (なし)");
            } else {
                this.candidates.forEach((c, i) => {
                    const sel = i === this.pickIndex;
                    lines.push(`${cursor(sel)}${this.candidateLabel(c)}`);
                });
            }
        }

        // 操作ヒント
        lines.push("", this.hint());

        this.body.innerHTML = lines.join("\n");
    }

    /** PICK 中、カーソル上の候補を着け替えたと仮定した最終ステータス */
    private previewStats(): BaseStats {
        const member = this.member;
        const choice = this.candidates[this.pickIndex];
        const hypo: EquipmentMap = { ...member.equipment };

        if (choice === EquipmentOverlay.UNEQUIP) {
            delete hypo[this.slot];
        } else if (choice) {
            hypo[this.slot] = choice;
        }
        return computeFinalStats(member.baseStats, hypo);
    }

    private statRow(label: string, oldV: number, newV?: number): string {
        if (newV === undefined || newV === oldV) return `  ${label}: ${oldV}`;
        const diff = newV - oldV;
        const arrow = diff > 0 ? `▲+${diff}` : `▼${diff}`;
        const color = diff > 0 ? "#7dff7d" : "#ff8a8a";
        return `  ${label}: ${oldV} → <span style="color:${color}">${newV} (${arrow})</span>`;
    }

    private candidateLabel(c: string): string {
        if (c === EquipmentOverlay.UNEQUIP) return "── はずす ──";
        const preset = getEquipmentById(c);
        if (!preset) return c;
        const count = this.gameState.equipment[c] ?? 0;
        const stat = Object.entries(preset.stats)
            .map(([k, v]) => `${k}${(v ?? 0) >= 0 ? "+" : ""}${v}`)
            .join(" ");
        return `${preset.name} ×${count}  [${stat}]`;
    }

    private hint(): string {
        switch (this.mode) {
            case "MEMBER": return "↑↓:キャラ選択  決定:そうびへ  キャンセル:閉じる";
            case "SLOT": return "↑↓:スロット選択  決定:装備を選ぶ  キャンセル:戻る";
            case "PICK": return "↑↓:候補選択  決定:着ける/はずす  キャンセル:戻る";
        }
    }
}
