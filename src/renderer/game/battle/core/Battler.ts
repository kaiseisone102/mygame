// src/renderer/game/battle/core/Battler.ts

import { StackRule } from "../../../../shared/type/battle/status/StackRule";
import { BattlerPort } from "../../../../shared/type/battle/port/BattlerPort";
import { StatusContext } from "../../../../shared/type/battle/status/context/statusContext";
import { StatusEffect, StatusId } from "../../../../shared/type/battle/status/StatusEffect";
import { Buff } from "../logic/status/effects/buff";
import { BattlerSide, LevelGrowthTable } from "../../../../shared/type/battle/BattleAction";
import { Trait } from "../../../../shared/type/battle/trait/Trait";
import { AiType } from "../../../../shared/master/battle/type/EnemyPreset ";
import { SkillId } from "../../../../shared/master/battle/type/SkillPreset";
import { StatusInstance } from "../../../../shared/type/battle/status/StatusInstance";
import { StatusCategory } from "../../../../shared/type/battle/status/StatusCategory";
import { BattleEvent } from "../../../../shared/type/battle/event/BattleEvent";
import { EventContext } from "../../../../shared/type/battle/event/EventContext";
import { BuffPresets } from "../../../../shared/master/battle/BuffPreset";
import { StatusTickType } from "../../../../shared/type/battle/status/constants/statusConstant";

type LevelUpResult = {
    level: number
    gainedStats: Partial<BaseStats>
}
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
    skills?: SkillId[];
    traits?: Trait[];
    aiType?: AiType
}

export interface BaseStats {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
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

    level: number;
    exp: number;

    baseStats!: {
        hp: number;
        maxHp: number;
        mp: number;
        maxMp: number;

        attack: number;
        defense: number;
        magic: number;
        speed: number;
    };

    // alive は状態ではなく、計算結果 死亡条件は && で追加できる
    get alive() {
        return this.baseStats.hp > 0 && !this.hasStatus(StatusId.DEAD);
    }

    // 習得スキル
    skills: SkillId[];     // skillId 配列
    traits: Trait[]; // ← 個性

    statusEffects: StatusInstance[] = [];
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

        this.initializeStats(params.baseStats ?? {});

        this.skills = params.skills ?? [];
        this.traits = params.traits ?? [];
        this.growthTable = params.growthTable;
        this.statModifier = params.statModifier ?? 1;
        this.aiType = params.aiType ?? AiType.AGGRESSIVE;
    }

    /* =====================
           ステータス操作
        ===================== */
    addHp(amount: number) {
        return this.baseStats.hp = Math.min(this.baseStats.maxHp, this.baseStats.hp + amount);
    }

    addMp(amount: number) {
        this.baseStats.mp = Math.min(this.baseStats.maxMp, Math.max(0, this.baseStats.mp + amount));
    }

    addStatus(newStatus: StatusInstance) {

        // 同カテゴリの既存状態
        const sameCategory: StatusInstance[] = [];

        for (const s of this.statusEffects) {
            if (s.category === newStatus.category) {
                sameCategory.push(s);
            }
        }

        // 同カテゴリが存在する場合
        if (sameCategory.length > 0) {

            const strongest = sameCategory.reduce((a, b) =>
                (a.priority ?? 0) >= (b.priority ?? 0) ? a : b
            );

            // 新しい状態が弱い or 同等なら無視
            if ((newStatus.priority ?? 0) <= (strongest.priority ?? 0)) {
                return;
            }

            // 強い状態が来た → 既存カテゴリ全削除
            for (const s of sameCategory) {
                s.onExpire?.(this);
            }

            this.statusEffects = this.statusEffects.filter(
                s => s.category !== newStatus.category
            );
        }

        // 同IDの状態（重複ルール）
        const sameId = this.statusEffects.find(e => e.id === newStatus.id);

        if (!sameId) {
            this.statusEffects.push(newStatus);
            newStatus.onApply?.(this);
        } else {
            switch (newStatus.stackRule) {
                case StackRule.IGNORE:
                    return;

                case StackRule.REPLACE:
                    sameId.onExpire?.(this);
                    this.statusEffects = this.statusEffects.filter(e => e !== sameId);
                    this.statusEffects.push(newStatus);
                    newStatus.onApply?.(this);
                    return;

                case StackRule.EXTEND:
                    if (sameId.duration > 0 && newStatus.duration > 0) {
                        sameId.duration += newStatus.duration;
                    }
                    return;

                case StackRule.STACK:
                    this.statusEffects.push(newStatus);
                    newStatus.onApply?.(this);
                    return;
            }
        }

        this.statusEffects.sort(
            (a, b) => (b.order ?? 0) - (a.order ?? 0)
        );
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
            case StackRule.IGNORE:
                return;
            case StackRule.REPLACE:
                Object.assign(existing, buff);
                return;
            case StackRule.STACK:
                existing.turns += buff.turns;
                return;
            case StackRule.EXTEND:
                existing.turns += buff.turns;
                return;
        }
    }

    /* =====================
      ターン開始処理
    ===================== */
    onTurnStart() {
        // ===== 状態異常処理 =====
        // order順で処理
        const effects = [...this.statusEffects].sort(
            (a, b) => (b.order ?? 0) - (a.order ?? 0)
        );
        // ターン開始処理（毒など）
        for (const effect of effects) {

            if (effect.tickType === StatusTickType.TURN_START) {
                effect.onTurnTick?.(this);
            }

        }

        // expire 処理
        this.statusEffects = this.statusEffects.filter(effect => {

            if (effect.shouldExpire?.()) {
                effect.onExpire?.(this);
                return false;
            }

            if (effect.duration > 0) {
                effect.duration--;
                if (effect.duration === 0) {
                    effect.onExpire?.(this);
                    return false;
                }
            }

            return true;
        });

        // ===== buff 処理 =====
        this.buffs = this.buffs.filter(buff => {
            if (buff.turns > 0) buff.turns--;
            return buff.turns !== 0;
        });
    }

    onTurnEnd() {

        const effects = [...this.statusEffects].sort(
            (a, b) => (b.order ?? 0) - (a.order ?? 0)
        );

        for (const effect of effects) {

            if (effect.tickType === StatusTickType.TURN_END) {
                effect.onTurnTick?.(this);
            }

        }

    }

    /* =====================
        行動可能判定
    ===================== */
    canAct(): boolean {
        return !this.statusEffects.some(s => s.blocksAction);
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

    levelUp(): LevelUpResult {
        const nextLevel = this.level + 1;
        const growth = this.growthTable?.[nextLevel];

        if (!growth) return { level: this.level, gainedStats: this.baseStats }; // 最大レベルなら成長なし

        const modifier = this.statModifier ?? 1;

        this.baseStats.maxHp = this.applyGrowth(this.baseStats.maxHp, growth.hp, modifier);
        this.baseStats.maxMp = this.applyGrowth(this.baseStats.maxMp, growth.mp, modifier);

        this.baseStats.attack = this.applyGrowth(this.baseStats.attack, growth.attack, modifier);
        this.baseStats.defense = this.applyGrowth(this.baseStats.defense, growth.defense, modifier);
        this.baseStats.magic = this.applyGrowth(this.baseStats.magic, growth.magic, modifier);
        this.baseStats.speed = this.applyGrowth(this.baseStats.speed, growth.speed, modifier);

        this.level = nextLevel;

        this.baseStats.hp = this.baseStats.maxHp; // レベルアップ時全回復なら明示
        this.baseStats.mp = this.baseStats.maxMp;

        return { level: nextLevel, gainedStats: growth }
    }

    /* =====================
        経験値処理
    ===================== */
    gainExp(amount: number) {
        this.exp += amount;

        while (this.exp >= this.expToNextLevel()) {
            this.exp -= this.expToNextLevel();
            this.levelUp();
        }
    }

    expToNextLevel(): number {
        return 100 * this.level;
    }

    private initializeStats(base: Partial<BaseStats>) {

        const hp = base.hp ?? 10;
        const maxHp = base.maxHp ?? hp;

        const mp = base.mp ?? 5;
        const maxMp = base.maxMp ?? mp;

        this.baseStats = {
            hp,
            maxHp,
            mp,
            maxMp,
            attack: base.attack ?? 5,
            defense: base.defense ?? 3,
            magic: base.magic ?? 5,
            speed: base.speed ?? 5
        };
    }

    hasStatus(id: StatusId): boolean {
        return this.statusEffects.some(status => status.id === id);
    }

    hasStatusCategory(category: StatusCategory): boolean {
        return this.statusEffects.some(s => s.category === category);
    }

    getStatus(id: StatusId): StatusInstance | undefined {
        return this.statusEffects.find(s => s.id === id) ?? undefined;
    }

    hasAnyStatus(ids: StatusId[]): boolean {
        return this.statusEffects.some(s => ids.includes(s.id));
    }

    emitEvent(event: BattleEvent, ctx: EventContext) {

        for (const status of this.statusEffects) {
            status.onEvent?.(event, ctx);
        }
    }

    getStat(stat: keyof BaseStats): number {

        let value = this.baseStats[stat];

        // buff
        for (const buff of this.buffs) {

            const preset = BuffPresets[buff.id];

            if (!preset) continue;

            if (preset.category === stat) continue;

            value = preset.apply(value, buff.value);

        }

        // ===== Trait =====
        for (const trait of this.traits) {

            if (!trait.modifyStat) continue;

            value = trait.modifyStat(stat, value);
        }

        // ===== Status =====
        for (const status of this.statusEffects) {

            if (!status.statModifier) continue;

            value = status.statModifier(stat, value);
        }

        return value;
    }
}