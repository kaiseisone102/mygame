// src/renderer/game/battle/core/BattleState.ts

import { BattlerSaveData } from "../../../../shared/data/BattlerSaveData";
import { DEFAULT_PLAYER_BASE_STATS } from "../../../../shared/data/playerConstants";
import { TraitId, TraitPresets } from "../../../../shared/master/battle/TraitPresets";
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

    currentActorId: 0,
    order: [],

    actionQueue: [],

    result: BattleResult.NULL,
    finished: false,

    mode: CommandMode.NULL,
};

export function createAllies(): Battler[] {
    const allyData: BattlerParams[] = [
        {
            templateId: 1,
            instanceId: 1,
            name: "Hero",
            exp: 0,
            side: BattlerSide.ALLY,
            baseStats: { hp: 100, mp: 50, attack: 6, defense: 4, speed: 20 },
            growthTable: {},
            skills: [
                TechniqueId.DOUBLE_ATTACK,
                TechniqueId.POWER_SLASH,
                TechniqueId.WHIRL_WIND,


                MagicId.HASTE,

                MagicId.ATK_DOWN,
                MagicId.HEAL_ALL,
                MagicId.GIGADEIN
            ],
            traits: [TraitPresets.WEAK_FIRE]
        },
        {
            templateId: 2,
            instanceId: 2,
            name: "Mage",
            level: 1,
            exp: 0,
            side: BattlerSide.ALLY,
            baseStats: { hp: 80, mp: 80, attack: 4, defense: 2, magic: 20, speed: 10 },
            growthTable: {},
            skills: [
                MagicId.MERA,
                MagicId.GIRA,
                MagicId.IO,
                MagicId.HYADO,
                MagicId.RAIDEIN,
                MagicId.BAGI,
                MagicId.HEAL,
                MagicId.HEAL_ALL,
                MagicId.REVIVE,

                MagicId.ATK_UP_SMALL,
                MagicId.ATK_UP_LARGE,
                MagicId.DEF_UP,
                MagicId.HASTE,

                MagicId.ATK_DOWN,
                MagicId.SLOW,

                MagicId.SLEEP,
                MagicId.POISON,
                MagicId.PARALYZE,

                MagicId.GIGADEIN
            ],
            traits: [TraitPresets.RESIST_MAGIC]
        },
    ];

    return allyData.map(p => new Battler(p));
}

/**
 * ダミー敵を作る
 */
function createDummyEnemies(): Battler[] {
    const enemyData: BattlerParams[] = [
        {
            templateId: 101,
            instanceId: 3,
            name: "Slime うんこ",
            exp: 0,
            side: BattlerSide.ENEMY,
            baseStats: { hp: 10, attack: 3, defense: 1, speed: 15 },
            growthTable: {},
            skills: [],
            traits: [TraitPresets.WEAK_FIRE]
        },
        {
            templateId: 102,
            instanceId: 4,
            name: "Slime B",
            exp: 0,
            side: BattlerSide.ENEMY,
            baseStats: { hp: 12, attack: 4, defense: 2, speed: 8 },
            growthTable: {},
            skills: [],
            traits: [TraitPresets.RESIST_MAGIC]
        },
        {
            templateId: 103,
            instanceId: 5,
            name: "Slime C",
            exp: 0,
            side: BattlerSide.ENEMY,
            baseStats: { hp: 8, attack: 2, defense: 1, speed: 5 },
            growthTable: {},
            skills: [],
            traits: []
        },
    ];

    return enemyData.map(params => new Battler(params));
}

/**
 * 初期 BattleState を生成（仮敵入り）
 */
export function createInitialBattleState(): BattleState {
    const allies = createAllies();
    const enemies = createDummyEnemies();

    const allBattlers = [...allies, ...enemies];

    // 仮でID順で行動順を決める
    const order = [...allBattlers].sort((a, b) => a.templateId - b.templateId).map(b => b.templateId);;

    return {
        ...initialBattleState,
        allies,
        enemies,
        turn: 1,
        currentActorId: order[0],
        order,
    };
}

export function createInitialParty(): BattlerSaveData {
    return {
        templateId: 1,
        instanceId: 1,
        name: "Hero",
        level: 1,
        exp: 0,
        baseStats: DEFAULT_PLAYER_BASE_STATS,
        skills: [
            TechniqueId.DOUBLE_ATTACK,
            TechniqueId.POWER_SLASH,
            TechniqueId.WHIRL_WIND,


            MagicId.HASTE,

            MagicId.ATK_DOWN,
            MagicId.HEAL_ALL,
            MagicId.GIGADEIN
        ],
        traits: [TraitId.WEAK_FIRE],
        buffs: [],
        statusEffects: []
    }
}