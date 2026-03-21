// src/renderer/game/battle/core/StatusManager.ts

import { DamageResult, HealResult, SkillResult, StatusResult } from "../../../../shared/type/battle/result/SkillResult";
import { StatusCategory, StatusId, StatusInstance, StatusPresets } from "../../../../shared/master/battle/StatusPreset";
import { IBattler } from "../../../../shared/type/battle/port/BattlerPort";
import { StatusTickType } from "../../../../shared/type/battle/status/constants/statusConstant";
import { StatusContext } from "../../../../shared/type/battle/status/context/statusContext";
import { StackRule } from "../../../../shared/type/battle/status/StackRule";
import { SkillEffectKindId } from "../../../../shared/type/battle/skill/skillFormula";

export class StatusManager {
    private _effects: StatusInstance[] = [];

    constructor(private owner: IBattler) { }

    get effects(): StatusInstance[] {
        return this._effects;
    }

    /** 状態異常/バフの追加 */
    add(newStatus: StatusInstance) {
        // 新しいステータスのマスタデータを取得
        const newPreset = StatusPresets[newStatus.statusId];

        // 同カテゴリの既存状態を取得
        const sameCategory = this._effects.filter(
            s => StatusPresets[s.statusId].category === newPreset.category
        );

        // 同カテゴリが存在する場合
        if (sameCategory.length > 0) {
            // 現在適用中の最も強い（優先度が高い）効果を取得
            const strongest = sameCategory.reduce((a, b) =>
                (StatusPresets[a.statusId].priority ?? 0) >= (StatusPresets[b.statusId].priority ?? 0) ? a : b
            );
            const strongestPreset = StatusPresets[strongest.statusId];

            // A. 新しい状態が弱いなら無視
            if ((newPreset.priority ?? 0) < (strongestPreset.priority ?? 0)) {
                console.log(`${newPreset.name} は ${strongestPreset.name} にかき消された`);
                return;
            }

            // B. 新しい状態の方が強い場合、既存の同カテゴリを削除
            if ((newPreset.priority ?? 0) > (strongestPreset.priority ?? 0)) {
                this.removeByCategory(newPreset.category);
            }

            // C. 同じ強さ（priorityが同等）の場合
            else {
                const sameIdInstance = sameCategory.find(s => s.statusId === newStatus.statusId);
                if (sameIdInstance) {
                    this.applyStackRule(sameIdInstance, newStatus);
                    return;
                }
            }
        }

        // 新規追加
        this._effects.push(newStatus);
        newPreset.onApply?.(this.createContext(newStatus));
        this.sort();
    }

    /** ターン経過処理（Tick実行と継続ターン減少） */
    processTurnTick(tickType: StatusTickType): SkillResult[] {
        const results: SkillResult[] = [];

        // 実行順序に従ってソート（最新の状態を反映）
        this.sort();

        // --- ターン開始時のみ、継続ターンを一括で更新する ---
        if (tickType === StatusTickType.TURN_START) {
            const expiredIds = this.updateDurations();

            // 解除された（期限切れになった）ステータスを結果に追加
            for (const statusId of expiredIds) {
                results.push({
                    kind: SkillEffectKindId.STATUS,
                    instanceId: this.owner.instanceId,
                    targetId: this.owner.instanceId,
                    statusId: statusId,
                    success: true,
                    removed: true
                } as StatusResult);
            }
        }

        // 残った status のTick実行（毒ダメージやリジェネなど）
        // ループ中に要素が削除されても大丈夫なようにコピーで回す
        for (const instance of [...this._effects]) {
            const status = StatusPresets[instance.statusId];
            const ctx = this.createContext(instance);

            // 実行前のHPを記録（ダメージ・回復量計算用）
            const preHp = ctx.target.baseStats.hp;

            // 汎用Tick
            if (status.tickType === tickType) {
                status.onTurnTick?.(ctx);
            }

            // 開始時・終了時の固有コールバック
            if (tickType === StatusTickType.TURN_START) {
                status.onTurnStart?.(ctx);
            } else if (tickType === StatusTickType.TURN_END) {
                status.onTurnEnd?.(ctx);
            }

            // --- 実行結果の記録 ---
            const postHp = ctx.target.baseStats.hp;
            const hpDiff = preHp - postHp;

            if (hpDiff > 0) {
                // ダメージが発生した場合
                results.push({
                    kind: SkillEffectKindId.DAMAGE,
                    instanceId: instance.actorId ?? ctx.target.instanceId, // かけた本人、いなければ自分
                    targetId: ctx.target.instanceId,
                    value: hpDiff,
                    isCritical: false,
                    killed: !ctx.target.alive,
                    success: true,
                    statusId: instance.statusId
                } as DamageResult);
            } else if (hpDiff < 0) {
                // 回復が発生した場合 (リジェネなど)
                results.push({
                    kind: SkillEffectKindId.HEAL,
                    instanceId: instance.actorId ?? ctx.target.instanceId,
                    targetId: ctx.target.instanceId,
                    value: Math.abs(hpDiff),
                    success: true,
                    statusId: instance.statusId
                } as HealResult);
            }
        }

        return results;
    }

    /** 継続ターンの更新と期限切れチェック */
    private updateDurations(): string[] {
        const expiredIds: string[] = [];

        this._effects = this._effects.filter(instance => {
            const status = StatusPresets[instance.statusId];
            const ctx = this.createContext(instance);

            let shouldRemove = false;

            // A. 特殊な解除判定
            if (status.shouldExpire?.()) {
                shouldRemove = true;
            }

            // B. ターン制の処理 (-1は永続)
            if (instance.duration > 0) {
                instance.duration--;
                if (instance.duration === 0) shouldRemove = true;
            }
            if (shouldRemove) {
                status.onExpire?.(ctx);
                expiredIds.push(instance.statusId); // IDを記録
                return false;
            }
            return true;
        });
        return expiredIds;
    }

    // --- ユーティリティメソッド群 ---

    /** 指定したIDの状態を持っているか */
    has(id: StatusId): boolean {
        return this._effects.some(s => s.statusId === id);
    }

    /** 指定したカテゴリの状態を持っているか */
    hasCategory(category: StatusCategory): boolean {
        return this._effects.some(s => StatusPresets[s.statusId].category === category);
    }

    /** 特定の状態を削除 */
    remove(id: StatusId) {
        this._effects = this._effects.filter(s => {
            if (s.statusId === id) {
                StatusPresets[s.statusId].onExpire?.(this.createContext(s));
                return false;
            }
            return true;
        });
    }

    /** カテゴリ指定で削除 */
    removeByCategory(category: StatusCategory) {
        this._effects = this._effects.filter(s => {
            if (StatusPresets[s.statusId].category === category) {
                StatusPresets[s.statusId].onExpire?.(this.createContext(s));
                return false;
            }
            return true;
        });
    }

    private applyStackRule(existing: StatusInstance, next: StatusInstance) {
        const preset = StatusPresets[next.statusId];

        switch (preset.stackRule) {

            case StackRule.EXTEND:
                existing.duration += next.duration;
                break;

            case StackRule.REPLACE:
                existing.duration = next.duration;
                if (next.value !== undefined) existing.value = next.value;
                break;

            case StackRule.STACK:
                // STACKの場合は add 本体で push するように調整が必要
                break;

            case StackRule.IGNORE:
                break;
        }
    }

    private sort() {
        this._effects.sort((a, b) =>
            (StatusPresets[b.statusId].order ?? 0) - (StatusPresets[a.statusId].order ?? 0)
        );
    }

    private createContext(instance: StatusInstance): StatusContext {
        return {
            target: this.owner,
            instance: instance,
            preset: StatusPresets[instance.statusId]
        };
    }
}