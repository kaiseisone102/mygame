// src/renderer/game/battle/logic/rewards/RewardCalculator.ts

import { BattleState } from "../../core/BattleState";

export interface ExpReward {
    instanceId: number;
    gainedExp: number;
}

export class RewardCalculator {
    /**
     * 敵の合計経験値を計算
     */
    calculateTotalExp(state: BattleState): number {
        return state.enemies.reduce((sum, enemy) => sum + (enemy.exp ?? 0), 0);
    }

    /**
     * 敵の合計ゴールドを計算(撃破報酬)
     */
    calculateTotalGold(state: BattleState): number {
        return state.enemies.reduce((sum, enemy) => sum + (enemy.goldReward ?? 0), 0);
    }

    /**
     * 生存している味方に経験値を均等に分配
     * (死亡者にも配る場合は filter を外すなど調整可能)
     */
    calculateExpForAllies(state: BattleState): ExpReward[] {
        const totalExp = this.calculateTotalExp(state);
        const allies = state.allies;
        
        if (allies.length === 0) return [];

        const perAlly = Math.floor(totalExp / allies.length);

        return allies.map(a => ({
            instanceId: a.instanceId,
            gainedExp: perAlly
        }));
    }
}