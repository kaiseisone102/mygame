// src/renderer/game/battle/service/BattleResultProcess.ts

import { GameState } from "../../../../shared/data/gameState";
import { GrowTableJson } from "../../../../shared/Json/growTable/growTableJson";
import { BattleManager } from "../core/BattleManager";
import { BattleResult } from "../../../../shared/type/battle/TargetType";
import { LevelUpPayload } from "../../../screens/battleScene/overlayScreen/LevelUpOverlay";
import { RewardCalculator } from "../logic/rewards/RewardCalculator";
import { AiType } from "../../../../shared/master/battle/type/EnemyPreset ";

export type ExpLog = {
    name: string;
    gainedExp: number;
    oldExp: number;
    newExp: number;
    expRequired: number;
};

export type BattleResultProcess = {
    expLogs: ExpLog[];
    levelUps: LevelUpPayload[];
};

export class BattleResultService {

    constructor(
        private gameState: GameState,
        private growTable: GrowTableJson,
        private manager: BattleManager,
        private rewardCalculator: RewardCalculator
    ) { }

    process(result: BattleResult): BattleResultProcess {

        const expLogs: ExpLog[] = [];
        const levelUps: LevelUpPayload[] = [];

        // 戦闘結果を gameState に反映
        const state = this.manager.getState();

        // 1. 【共通処理】戦闘結果のステータス（消耗状態）を GameState に反映
        const alliesData = state.allies.map(ally => ({
            actorMasterId: ally.actorMasterId,
            instanceId: ally.instanceId,
            name: ally.name,
            level: ally.level,
            exp: ally.exp,
            baseStats: { ...ally.baseStats },
            skillIds: [...ally.skillIds],
            traits: ally.traits.map(trait => trait.id),
            statusEffects: [...ally.statusEffects],
            aiType: ally.aiType ?? AiType.AGGRESSIVE
        }));

        // GameState に反映
        this.gameState.applyBattleResult(alliesData);

        // 2. 勝利時以外はここで終了（保存したデータで復帰するだけ）
        if (result !== BattleResult.WIN) {
            return { expLogs, levelUps };
        }

        // 3. 【勝利時のみ】経験値分配とレベルアップ処理
        const expDistribution = this.rewardCalculator.calculateExpForAllies(state);

        for (const distribution of expDistribution) {

            const ally = this.gameState.party.find(p => p.instanceId === distribution.instanceId);
            if (!ally) {
                console.warn("ally not found", distribution.instanceId);
                continue;
            }

            // 仮ログ用
            const oldExp = ally.exp;
        
            // 経験値加算
            ally.exp += distribution.gainedExp;

            // --- バトルログに経験値情報を表示 ---
            const nextGrow = this.growTable[ally.level + 1];
            const expRequired = nextGrow?.expRequired ?? Infinity;

            expLogs.push({
                name: ally.name,
                gainedExp: distribution.gainedExp,
                oldExp,
                newExp: ally.exp,
                expRequired
            });

            // レベルアップ判定
            while (ally.level < 100) {

                const nextLevel = ally.level + 1;
                const grow = this.growTable[nextLevel];
                if (!grow) break;
                if ((grow.expRequired ?? Infinity) > ally.exp) break;

                // このレベルに上がる直前のステータスをコピー
                const statsBeforeThisLevel = { ...ally.baseStats };

                const oldLevel = ally.level;
                ally.level = nextLevel;

                ally.baseStats.maxHp = grow.maxHp;
                ally.baseStats.maxMp = grow.maxMp;
                ally.baseStats.attack = grow.attack;
                ally.baseStats.defense = grow.defense;
                ally.baseStats.magic = grow.magic;
                ally.baseStats.speed = grow.speed;

                // 上昇した差分だけ現在値も増やす
                if (ally.baseStats.hp > 0) {
                    const hpDiff = grow.maxHp - statsBeforeThisLevel.maxHp;
                    const mpDiff = grow.maxMp - statsBeforeThisLevel.maxMp;

                    ally.baseStats.hp += hpDiff;
                    ally.baseStats.mp += mpDiff;
                }

                levelUps.push({
                    name: ally.name,
                    oldLevel,
                    newLevel: ally.level,
                    oldStats: statsBeforeThisLevel,
                    newStats: { ...ally.baseStats }
                });
            }
        }

        return { expLogs, levelUps };
    }
}