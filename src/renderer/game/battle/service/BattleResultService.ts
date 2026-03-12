// src/renderer/game/battle/service/BattleResultProcess.ts

import { GameState } from "../../../../shared/data/gameState";
import { GrowTableJson } from "../../../../shared/Json/growTable/growTableJson";
import { BattleManager } from "../core/BattleManager";
import { BattleResult } from "../../../../shared/type/battle/TargetType";
import { LevelUpPayload } from "../../../screens/battleScene/overlayScreen/LevelUpOverlay";

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
        private manager: BattleManager
    ) { }

    process(result: BattleResult): BattleResultProcess {

        const expLogs: ExpLog[] = [];
        const levelUps: LevelUpPayload[] = [];

        // 戦闘結果を gameState に反映
        const state = this.manager.getState();

        // 味方それぞれの Battler を GameState 用データに変換
        const alliesData = state.allies.map(a => ({
            templateId: a.templateId,
            instanceId: a.instanceId,
            name: a.name,
            level: a.level,
            exp: a.exp,
            baseStats: a.baseStats,
            skills: a.skills,
            buffs: a.buffs,
            statusEffects: a.statusEffects,
        }));

        // GameState に反映
        this.gameState.applyBattleResult(alliesData);

        // --- 経験値分配 ---
        const expDistribution = this.manager.calculateExpForAllies();

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

            if (result !== BattleResult.WIN) continue;

            // レベルアップ判定
            while (ally.level < 100) {

                const nextLevel = ally.level + 1;
                const grow = this.growTable[nextLevel];
                if (!grow) break;

                if ((grow.expRequired ?? Infinity) > ally.exp) break;

                const oldLevel = ally.level;
                ally.level = nextLevel;

                ally.baseStats.hp = grow.maxHp;
                ally.baseStats.mp = grow.maxMp;
                ally.baseStats.attack = grow.attack;
                ally.baseStats.defense = grow.defense;
                ally.baseStats.magic = grow.magic;
                ally.baseStats.speed = grow.speed;

                levelUps.push({
                    name: ally.name,
                    oldLevel,
                    newLevel: ally.level
                });
            }
        }

        return {
            expLogs,
            levelUps
        };
    }
}