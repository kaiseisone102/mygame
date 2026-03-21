// src/renderer/game/battle/core/GrowthManager.ts

import { BaseStats } from "../../../../shared/data/playerConstants";
import { LevelGrowthTable } from "../../../../shared/type/battle/BattleAction";

export type LevelUpResult = {
    level: number;
    gainedStats: Partial<BaseStats>;
};

export class GrowthManager {
    constructor(
        private _level: number,
        private _exp: number,
        private growthTable?: LevelGrowthTable,
        private statModifier: number = 1
    ) {}

    get level(): number { return this._level; }
    get exp(): number { return this._exp; }

    /** 経験値を獲得し、必要に応じてレベルアップ処理を繰り返す */
    gainExp(amount: number, currentStats: BaseStats): LevelUpResult[] {
        this._exp += amount;
        const results: LevelUpResult[] = [];

        while (this._exp >= this.getExpToNextLevel()) {
            this._exp -= this.getExpToNextLevel();
            const result = this.levelUp(currentStats);
            if (result) {
                results.push(result);
            } else {
                // 次のレベルの成長データがない（最大レベル）場合はループ終了
                break;
            }
        }
        return results;
    }

    /** 次のレベルまでに必要な経験値の計算 */
    getExpToNextLevel(): number {
        return 100 * this._level;
    }

    /** 1レベル分の上昇処理 */
    private levelUp(stats: BaseStats): LevelUpResult | null {
        const nextLevel = this._level + 1;
        const growth = this.growthTable?.[nextLevel];

        if (!growth) return null;

        // 各ステータスに成長値を適用
        stats.maxHp = this.calculateGrowth(stats.maxHp, growth.hp);
        stats.maxMp = this.calculateGrowth(stats.maxMp, growth.mp);
        stats.attack = this.calculateGrowth(stats.attack, growth.attack);
        stats.defense = this.calculateGrowth(stats.defense, growth.defense);
        stats.magic = this.calculateGrowth(stats.magic, growth.magic);
        stats.speed = this.calculateGrowth(stats.speed, growth.speed);

        // レベルアップ時は全回復（仕様に合わせて調整）
        stats.hp = stats.maxHp;
        stats.mp = stats.maxMp;

        this._level = nextLevel;

        return {
            level: this._level,
            gainedStats: growth
        };
    }

    private calculateGrowth(current: number, growthValue: number | undefined): number {
        return current + Math.floor((growthValue ?? 0) * this.statModifier);
    }
}