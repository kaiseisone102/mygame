// src/renderer/game/battle/core/BattleState.ts

import { TraitPresets } from "../../../../shared/master/battle/TraitPresets";
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

    mode: CommandMode
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

export function createDummyAllies(): Battler[] {
    const allyData: BattlerParams[] = [
        {
            id: 1,
            name: "Hero",
            exp: 0,
            side: BattlerSide.ALLY,
            baseStats: { hp: 20, attack: 6, defense: 4, speed: 20 },
            growthTable: {},
            traits: [TraitPresets.WEAK_FIRE]
        },
        {
            id: 2,
            name: "Mage",
            exp: 0,
            side: BattlerSide.ALLY,
            baseStats: { hp: 12, attack: 4, defense: 2, magic: 6, speed: 10 },
            growthTable: {},
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
            id: 101,
            name: "Slime うんこ",
            exp: 0,
            side: BattlerSide.ENEMY,
            baseStats: { hp: 10, attack: 3, defense: 1, speed: 15 },
            growthTable: {},
            traits: [TraitPresets.WEAK_FIRE]
        },
        {
            id: 102,
            name: "Slime B",
            exp: 0,
            side: BattlerSide.ENEMY,
            baseStats: { hp: 12, attack: 4, defense: 2, speed: 8 },
            growthTable: {},
            traits: [TraitPresets.RESIST_MAGIC]
        },
        {
            id: 103,
            name: "Slime C",
            exp: 0,
            side: BattlerSide.ENEMY,
            baseStats: { hp: 8, attack: 2, defense: 1, speed: 5 },
            growthTable: {},
            traits: []
        },
    ];

    return enemyData.map(params => new Battler(params));
}

/**
 * 初期 BattleState を生成（仮敵入り）
 */
export function createInitialBattleState(): BattleState {
    const allies = createDummyAllies();
    const enemies = createDummyEnemies();

    const allBattlers = [...allies, ...enemies];

    // 仮でID順で行動順を決める
    const order = [...allBattlers].sort((a, b) => a.id - b.id).map(b => b.id);;

    return {
        ...initialBattleState,
        allies,
        enemies,
        turn: 1,
        currentActorId: order[0],
        order,
    };
}
