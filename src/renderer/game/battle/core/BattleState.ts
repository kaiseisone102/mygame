// src/renderer/game/battle/core/BattleState.ts

import { AiType } from "../../../../shared/master/battle/type/EnemyPreset ";
import { BattlerSaveData } from "../../../../shared/data/BattlerSaveData";
import { DEFAULT_PLAYER_BASE_STATS, DEFAULT_PLAYER_NAME } from "../../../../shared/data/playerConstants";
import { getTraitById, TraitId, TraitPresets } from "../../../../shared/master/battle/TraitPresets";
import { MagicId, TechniqueId } from "../../../../shared/master/battle/type/SkillPreset";
import { BattleAction, BattlerSide } from "../../../../shared/type/battle/BattleAction";
import { BattleResult, CommandMode } from "../../../../shared/type/battle/TargetType";
import { Battler, BattlerParams } from "./Battler";

/**
 * BattleState
 * 
 * 役割:
 * - HPを減らす
 * - MPを消費する
 * - 敵が死ぬ
 */
export type BattleState = {
    turn: number;
    allies: Battler[];
    enemies: Battler[];

    currentActorId: number; // ← 誰の番か
    order: number[];          // ← 行動順リスト

    actionQueue: BattleAction[];

    result: BattleResult;
    finished: boolean; // 戦闘が終わったか

    mode: CommandMode;
};

export const initialBattleState: BattleState = {
    turn: 1,
    allies: [],
    enemies: [],

    currentActorId: -1,
    order: [],

    actionQueue: [],

    result: BattleResult.NULL,
    finished: false,

    mode: CommandMode.NULL,
};

/**
 * 初期 BattleState を生成
 */
export const createInitialBattleState = (): BattleState => {
    return initialBattleState;
};

export function createAllies(saveData?: BattlerSaveData[]): Battler[] {
    // 1. 引数がある場合は、セーブデータを元に Battler インスタンスを生成
    if (saveData && saveData.length > 0) {
        return saveData.map(data => {
            // TraitId[] を Trait[] に変換する必要がある場合、ここでマスターデータから参照します
            // もし Battler コンストラクタ内で ID から実体を引いているならそのまま渡せます ありがとう
            const params: BattlerParams = {
                ...data,
                side: BattlerSide.ALLY,
                growthTable: {},
                // もし saveData の traits が ID 配列で、
                // BattlerParams が Trait オブジェクト配列を求めているなら find が必要 ありがとう
                traits: data.traits.map(id => getTraitById(id))
            };
            return new Battler(params);
        });
    }

    // セーブデータがない時の保険
    const allyData: BattlerParams[] = [
        {
            actorMasterId: 1,
            instanceId: 1,
            name: "Hero",
            level: 1,
            exp: 0,
            side: BattlerSide.ALLY,
            baseStats: { hp: 100, mp: 50, attack: 6, defense: 4, speed: 20 },
            skillIds: [],
            growthTable: {},
            traits: [TraitPresets.WEAK_FIRE],
            aiType: AiType.AGGRESSIVE
        },
        {
            actorMasterId: 2,
            instanceId: 2,
            name: "Mage",
            level: 1,
            exp: 0,
            side: BattlerSide.ALLY,
            baseStats: { hp: 80, mp: 80, attack: 4, defense: 2, magic: 20, speed: 10 },
            skillIds: [],
            growthTable: {},
            traits: [TraitPresets.RESIST_MAGIC],
            aiType: AiType.AGGRESSIVE
        },
    ];

    return allyData.map(p => new Battler(p));
}

export function createInitialParty(): BattlerSaveData[] {
    return [
        {
            actorMasterId: 1,
            instanceId: 1,
            name: DEFAULT_PLAYER_NAME,
            level: 1,
            exp: 0,
            baseStats: DEFAULT_PLAYER_BASE_STATS,
            skillIds: [
                TechniqueId.DOUBLE_ATTACK,
                TechniqueId.POWER_SLASH,
                TechniqueId.WHIRL_WIND,


                MagicId.HASTE,
                MagicId.MERA,
                MagicId.ATK_DOWN,
                MagicId.HEAL_ALL,
                MagicId.GIGADEIN
            ],
            traits: [TraitId.WEAK_FIRE],
            statusEffects: [],
            aiType: AiType.AGGRESSIVE
        },
        {
            actorMasterId: 2,
            instanceId: 2,
            name: DEFAULT_PLAYER_NAME,
            level: 1,
            exp: 0,
            baseStats: DEFAULT_PLAYER_BASE_STATS,
            skillIds: [
                TechniqueId.DOUBLE_ATTACK,
                TechniqueId.POWER_SLASH,
                TechniqueId.WHIRL_WIND,


                MagicId.HASTE,
                MagicId.MERA,
                MagicId.ATK_DOWN,
                MagicId.HEAL_ALL,
                MagicId.GIGADEIN
            ],
            traits: [TraitId.WEAK_FIRE],
            statusEffects: [],
            aiType: AiType.AGGRESSIVE
        },
    ]
}
