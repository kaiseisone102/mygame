// src/renderer/game/battle/core/StatCalculator.ts

import { BaseStats } from "../../../../shared/data/playerConstants";
import { StatusPresets } from "../../../../shared/master/battle/StatusPreset";
import { IBattler } from "../../../../shared/type/battle/port/BattlerPort";

export class StatCalculator {
    /**
     * 指定されたステータスの最終値を計算する
     * 計算順序: 1.基礎値 -> 2.特性(Trait)補正 -> 3.状態異常(Status)補正
     */
    static calculate(battler: IBattler, statKey: keyof BaseStats): number {
        let value = battler.baseStats[statKey];

        // 1. Trait (特性/パッシブ) による補正
        // battler.traits は IBattler に定義されている必要があります
        if ('traits' in battler) {
            for (const trait of (battler as any).traits) {
                if (trait.modifyStat) {
                    value = trait.modifyStat(statKey, value);
                }
            }
        }

        // 2. Status & Buff (状態異常) による補正
        for (const instance of battler.statusEffects) {
            const preset = StatusPresets[instance.statusId];

            // マスタデータに補正関数(statModifier)がある場合のみ実行
            if (preset.statModifier) {
                // instance.value (例: 攻撃力+20%など) を計算に利用
                value = preset.statModifier(statKey, value, instance);
            }
        }

        // 最終値は四捨五入や切り上げなど、ゲームバランスに合わせて調整
        return Math.ceil(value);
    }
}