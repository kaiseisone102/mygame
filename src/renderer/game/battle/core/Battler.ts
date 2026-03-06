// src/renderer/game/battle/core/Battler.ts

import { StackRuleId } from "../../../../shared/type/battle/status/StackRule";
import { BattlerPort } from "../../../../shared/type/battle/port/BattlerPort";
import { StatusContext } from "../../../../shared/type/battle/status/context/statusContext";
import { StatusEffect } from "../../../../shared/type/battle/status/StatusEffect";
import { Buff } from "../logic/status/effects/buff";
import { BattlerSide, LevelGrowthTable } from "../../../../shared/type/battle/BattleAction";
import { Trait } from "../../../../shared/type/battle/trait/Trait";
import { AiType } from "../../../../shared/master/battle/type/EnemyPreset ";

/* =====================
  Battler 用ユーティリティ
===================== */
export interface BattlerWithStatus {
    statusEffects: StatusEffect[];
    buffs: Buff[];

    addStatus(status: StatusEffect): void;
    addBuff(buff: Buff): void;
    removeStatus(id: string): void;
    removeBuff(id: string): void;
    decrementTurns(): void; // ターン経過で duration/turns 減らす
}

export type BattlerMethods = {
    addStatus: (effect: StatusEffect) => void;
    addBuff: (buff: Buff) => void;
    onTurnStart: () => void;
    canAct: () => boolean;
    levelUp: () => void;
    gainExp: (amount: number) => void;
};

export interface BattlerParams {
    id: number;
    name: string;
    side: BattlerSide;
    level?: number;
    exp: number;
    baseStats?: Partial<BaseStats>;
    growthTable: LevelGrowthTable;
    statModifier?: number; // キャラ固有補正
    skills?: string[];
    traits?: Trait[];
    aiType?: AiType
}

export interface BaseStats {
    hp: number;
    mp: number;
    attack: number;
    defense: number;
    magic: number;
    speed: number;
}
/**
 * Battler
 */
export class Battler implements StatusContext, BattlerPort {
    id: number;
    name: string;
    side: BattlerSide;

    level?: number;
    exp?: number;

    hp!: number;
    maxHp!: number;
    mp!: number;
    maxMp!: number;

    attack!: number;
    defense!: number;
    magic!: number;
    speed!: number;

    // alive は状態ではなく、計算結果 死亡条件は && で追加できる
    get alive() {
        return this.hp > 0;
    }

    // 習得スキル
    skills: string[];     // skillId 配列
    traits: Trait[]; // ← 個性

    statusEffects: StatusEffect[] = [];
    buffs: Buff[] = [];

    growthTable?: LevelGrowthTable;
    statModifier?: number;

    aiType?: AiType;

    constructor(params: BattlerParams) {
        this.id = params.id;
        this.name = params.name;
        this.side = params.side;

        this.level = params.level ?? 1;
        this.exp = params.exp ?? 0;

        this.skills = params.skills ?? [];
        this.traits = params.traits ?? [];
        this.growthTable = params.growthTable;
        this.statModifier = params.statModifier ?? 1;
        this.aiType = params.aiType ?? AiType.AGGRESSIVE;

        this.initializeStats(params.baseStats ?? {});
    }

    /* =====================
           ステータス操作
        ===================== */
    addHp(amount: number) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    addMp(amount: number) {
        this.mp = Math.min(this.maxMp, Math.max(0, this.mp + amount));
    }

    addStatus(effect: StatusEffect) {
        // 同カテゴリの既存状態
        const sameCategory = this.statusEffects.filter(
            s => s.category === effect.category
        );

        // 同カテゴリが存在する場合
        if (sameCategory.length > 0) {
            const strongest = sameCategory.reduce((a, b) =>
                a.priority >= b.priority ? a : b
            );

            // 新しい状態が弱い or 同等なら無視
            if (effect.priority <= strongest.priority) {
                return;
            }

            // 強い状態が来た → 既存カテゴリ全削除
            sameCategory.forEach(s => s.onExpire?.(this));
            this.statusEffects = this.statusEffects.filter(
                s => s.category !== effect.category
            );
        }

        // 同IDの状態（重複ルール）
        const sameId = this.statusEffects.find(e => e.id === effect.id);

        if (!sameId) {
            this.statusEffects.push(effect);
            effect.onApply?.(this);
            return;
        }

        switch (effect.stackRule) {
            case StackRuleId.IGNORE:
                return;

            case StackRuleId.REPLACE:
                sameId.onExpire?.(this);
                this.statusEffects = this.statusEffects.filter(e => e !== sameId);
                this.statusEffects.push(effect);
                effect.onApply?.(this);
                return;

            case StackRuleId.EXTEND:
                if (sameId.duration > 0 && effect.duration > 0) {
                    sameId.duration += effect.duration;
                }
                return;

            case StackRuleId.STACK:
                this.statusEffects.push(effect);
                effect.onApply?.(this);
                return;
        }
    }

    addTrait(trait: Trait) {
        this.traits.push(trait);
    }

    addBuff(buff: Buff) {
        const existing = this.buffs.find(b => b.id === buff.id);
        if (!existing) {
            this.buffs.push({ ...buff });
            return;
        }

        switch (buff.stackRule) {
            case StackRuleId.IGNORE:
                return;
            case StackRuleId.REPLACE:
                Object.assign(existing, buff);
                return;
            case StackRuleId.STACK:
                existing.turns += buff.turns;
                return;
            case StackRuleId.EXTEND:
                existing.turns += buff.turns;
                return;
        }
    }

    /* =====================
      ターン開始処理
    ===================== */
    onTurnStart() {
        // 状態異常処理
        this.statusEffects = this.statusEffects.filter(effect => {
            // ターン開始処理（毒など）
            effect.onTurnStart?.(this);

            // 確率解除
            if (effect.shouldExpire?.()) {
                effect.onExpire?.(this);
                return false;
            }

            // duration 管理
            if (effect.duration > 0) {
                effect.duration--;
                if (effect.duration === 0) {
                    effect.onExpire?.(this);
                    return false;
                }
            }

            return true;
        });

        // バフターン減少
        this.buffs = this.buffs.filter(buff => {
            if (buff.turns > 0) buff.turns--;
            return buff.turns !== 0;
        });
    }


    /* =====================
        行動可能判定
    ===================== */
    canAct(): boolean {
        return this.statusEffects.every(e => !e.onBeforeAction || e.onBeforeAction(this));
    }

    /* =====================
       レベルアップ処理
    ===================== */
    private applyGrowth(
        current: number,
        growth: number | undefined,
        modifier: number
    ) {
        return current + Math.floor((growth ?? 0) * modifier);
    }
    levelUp() {
        const nextLevel = (this.level ?? 1) + 1;
        const growth = this.growthTable?.[nextLevel];
        if (!growth) return; // 最大レベルなら成長なし

        const modifier = this.statModifier ?? 1;

        this.applyGrowth(this.maxHp, growth.hp, modifier);
        this.hp = this.maxHp; // レベルアップ時全回復なら明示

        this.maxMp = this.applyGrowth(this.maxMp, growth.mp, modifier);
        this.mp = this.maxMp;

        this.attack = this.applyGrowth(this.attack, growth.attack, modifier);
        this.defense = this.applyGrowth(this.defense, growth.defense, modifier);
        this.magic = this.applyGrowth(this.magic, growth.magic, modifier);
        this.speed = this.applyGrowth(this.speed, growth.speed, modifier);

        this.level = nextLevel;
    }

    /* =====================
        経験値処理
    ===================== */
    gainExp(amount: number) {
        this.exp = (this.exp ?? 0) + amount;
        // 例: 100 * レベルで次レベル必要経験値
        const lvl = this.level ?? 1;
        const required = 100 * lvl;
        if (this.exp >= required) {
            this.exp -= required;
            this.levelUp();
        }
    }

    private initializeStats(base: Partial<BaseStats>) {
        this.hp = base.hp ?? 10;
        this.maxHp = base.hp ?? 10;

        this.mp = base.mp ?? 5;
        this.maxMp = base.mp ?? 5;

        this.attack = base.attack ?? 5;
        this.defense = base.defense ?? 3;
        this.magic = base.magic ?? 5;
        this.speed = base.speed ?? 5;
    }
}