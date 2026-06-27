// src/renderer/game/battle/core/Battler.ts

import { SkillResult } from "../../../../shared/type/battle/result/SkillResult";
import { BaseStats } from "../../../../shared/data/playerConstants";
import { StatusId, StatusInstance, StatusPresets } from "../../../../shared/master/battle/StatusPreset";
import { AiType } from "../../../../shared/master/battle/type/EnemyPreset ";
import { SkillId } from "../../../../shared/master/battle/type/SkillPreset";
import { BattlerSide, LevelGrowthTable } from "../../../../shared/type/battle/BattleAction";
import { BattleEvent } from "../../../../shared/type/battle/event/BattleEvent";
import { EventContext } from "../../../../shared/type/battle/event/EventContext";
import { BattlerPort, IBattler } from "../../../../shared/type/battle/port/BattlerPort";
import { StatusTickType } from "../../../../shared/type/battle/status/constants/statusConstant";
import { StatusContext } from "../../../../shared/type/battle/status/context/statusContext";
import { Trait } from "../../../../shared/type/battle/trait/Trait";
import { ImageKey } from "../../../../shared/type/ImageKey";
import { JobId } from "../../../../shared/type/job/JobId";
import { EquipmentMap } from "../../../../shared/type/equipment/EquipSlot";
import { EQUIP_TRAIT_TAG, getEquipmentTraitIds, sumEquipBonus } from "../../../../shared/master/battle/EquipmentPreset";
import { getTraitById } from "../../../../shared/master/battle/TraitPresets";
import { GrowthManager, LevelUpResult } from "./GrowthManager";
import { StatCalculator } from "./StatCalculator";
import { StatusManager } from "./StatusManager";

export interface BattlerParams {
    actorMasterId: number;// 種族ID
    instanceId: number;// 個体ID
    name: string;
    side: BattlerSide;
    level: number;
    exp: number;
    baseStats: Partial<BaseStats>;
    growthTable: LevelGrowthTable;
    statModifier?: number; // キャラ固有補正
    skillIds: SkillId[];
    traits: Trait[];
    aiType: AiType;
    job?: JobId;              // 職(味方のみ。敵は未設定)
    equipment?: EquipmentMap; // 着用装備(味方のみ)
    goldReward?: number;   // 撃破時に得られるゴールド(敵のみ。味方は0)
    imageKey?: ImageKey;
}

/**
 * Battler
 */
export class Battler implements BattlerPort, IBattler {

    private statusManager: StatusManager;

    private growthManager: GrowthManager;

    // ぼうぎょ中か(被ダメージ半減)。自分のターン開始時に解除される。
    private guarding = false;

    actorMasterId: number;
    instanceId: number;
    name: string;
    side: BattlerSide;

    baseStats!: BaseStats;

    // 習得スキル
    skillIds: SkillId[];     // skillId 配列

    traits: Trait[]; // ← 個性

    // --- 装備 ---
    job?: JobId;
    equipment: EquipmentMap = {};
    equipBonus: Partial<BaseStats> = {}; // 装備の stats 合算(StatCalculator が参照)

    growthTable?: LevelGrowthTable;
    statModifier?: number;

    aiType?: AiType;

    imageKey?: ImageKey;

    // 撃破時に得られるゴールド(敵のみ設定。味方は0)
    goldReward: number = 0;

    constructor(params: BattlerParams) {
        this.actorMasterId = params.actorMasterId;
        this.instanceId = params.instanceId;
        this.name = params.name;
        this.side = params.side;

        this.initializeStats(params.baseStats ?? {});

        this.skillIds = params.skillIds ?? [];

        // --- 装備のセットアップ ---
        this.job = params.job;
        this.equipment = params.equipment ?? {};
        this.equipBonus = sumEquipBonus(this.equipment);
        // 装備由来の特性はタグを付けて追加する(戦闘後の永続化で除外し、累積を防ぐ)
        const equipTraits = getEquipmentTraitIds(this.equipment).map(id => {
            const base = getTraitById(id);
            return { ...base, tags: [...(base.tags ?? []), EQUIP_TRAIT_TAG] };
        });
        this.traits = [...(params.traits ?? []), ...equipTraits];

        this.growthTable = params.growthTable;
        this.statModifier = params.statModifier ?? 1;
        this.aiType = params.aiType ?? AiType.AGGRESSIVE;
        this.imageKey = params.imageKey ?? undefined;
        this.goldReward = params.goldReward ?? 0;

        this.statusManager = new StatusManager(this);

        this.growthManager = new GrowthManager(params.level ?? 1, params.exp ?? 0, params.growthTable, params.statModifier ?? 1);
    }

    get id(): string { return this.instanceId.toString(); }

    get level() { return this.growthManager.level; }
    get exp() { return this.growthManager.exp; }

    get hp(): number { return this.baseStats.hp; }
    get maxHp(): number { return this.baseStats.maxHp; }

    // alive は状態ではなく、計算結果 死亡条件は && で追加できる
    get alive() { return this.baseStats.hp > 0 && !this.hasStatus(StatusId.DEAD) };

    // --- 最終的な能力値を取得するゲッター群 ---
    /** 最終攻撃力 (バフ・特性・状態異常を反映) */
    get attack(): number { return StatCalculator.calculate(this, "attack") };
    /** 最終防御力 */
    get defense(): number { return StatCalculator.calculate(this, "defense") };
    /** 最終魔法力 */
    get magic(): number { return StatCalculator.calculate(this, "magic") };
    /** 最終素早さ */
    get speed(): number { return StatCalculator.calculate(this, "speed") };

    get statusEffects() { return this.statusManager.effects; }

    /* =====================
           ステータス操作
        ===================== */
    addHp(amount: number) {
        return this.baseStats.hp = Math.min(this.baseStats.maxHp, this.baseStats.hp + amount);
    }

    addMp(amount: number) {
        this.baseStats.mp = Math.min(this.baseStats.maxMp, Math.max(0, this.baseStats.mp + amount));
    }

    addTrait(trait: Trait) {
        this.traits.push(trait);
    }

    addStatus(status: StatusInstance) { this.statusManager.add(status); }
    removeStatus(id: StatusId) { this.statusManager.remove(id); }
    hasStatus(id: StatusId) { return this.statusManager.has(id); }

    /* =====================
      ターン開始処理
    ===================== */
    onTurnStart(): SkillResult[] {
        // 自分の番が来た = 前ターンの「ぼうぎょ」は解除
        this.guarding = false;
        // 全てのロジックをManager側で実行
        const results = this.statusManager.processTurnTick(StatusTickType.TURN_START);
        return results;
    }

    /** ぼうぎょ中か(DamagePipeline が被ダメージ半減に使用) */
    isGuarding(): boolean {
        return this.guarding;
    }

    /** ぼうぎょ状態をセット(ぼうぎょコマンド実行時に true) */
    setGuarding(value: boolean): void {
        this.guarding = value;
    }

    onTurnEnd(): SkillResult[] {
        // 終了タイミングの処理（リジェネなど）
        const results = this.statusManager.processTurnTick(StatusTickType.TURN_END);
        return results;
    }

    /* =====================
        行動可能判定
    ===================== */
    canAct(): boolean {
        // statusEffects をループし、それぞれの statusId からマスタデータを参照する
        for (const instance of this.statusEffects) {
            const preset = StatusPresets[instance.statusId];
            if (!preset) continue;

            // 完全行動不能(凍結・スタンなど)は無条件で行動不可
            if (preset.blocksAction === true) return false;

            // 確率・条件付きの行動判定。睡眠は常に false、麻痺・混乱は確率で false。
            // onBeforeAction が false を返したら、このターンは動けない。
            // ※ canAct() は 1ターンにつき1回だけ呼ばれる前提(乱数の二重消費を避ける)
            if (preset.onBeforeAction) {
                const ctx: StatusContext = { target: this, instance, preset };
                if (preset.onBeforeAction(ctx) === false) return false;
            }
        }

        // 行動を妨げる状態が一つもなければ true
        return true;
    }

    getStatus(id: StatusId): StatusInstance | undefined {
        // IDが一致するインスタンスを返す
        return this.statusEffects.find(instance => instance.statusId === id);
    }

    hasAnyStatus(ids: StatusId[]): boolean {
        // 指定された ID リストの中に statusId が含まれているか
        return this.statusEffects.some(instance => ids.includes(instance.statusId));
    }

    emitEvent(event: BattleEvent, ctx: EventContext) {
        for (const instance of this.statusEffects) {
            // マスタデータから onEvent を取得して実行
            const preset = StatusPresets[instance.statusId];

            if (!preset) {
                console.error(`StatusId "${instance.statusId}" が StatusPresets に見つかりません！`);
                continue;
            }

            preset.onEvent?.(event, ctx);
        }
    }

    /**
     * 内部で汎用的にステータスを取得したい場合
     */
    getStat(stat: keyof BaseStats): number {
        return StatCalculator.calculate(this, stat);
    }

    /** 経験値獲得 */
    gainExp(amount: number): LevelUpResult[] {
        return this.growthManager.gainExp(amount, this.baseStats);
    }

    /** 次のレベルまでの必要経験値 */
    expToNextLevel(): number {
        return this.growthManager.getExpToNextLevel();
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
            speed: base.speed ?? 5,
            luck: base.luck ?? 5,
            avoid: base.avoid ?? 5,
            critical: base.critical ?? 5,
        };
    }
}