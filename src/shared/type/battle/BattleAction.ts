// src/shared/type/battle/BattleAction.ts

import { BaseStats } from "../../data/playerConstants";
import { SkillId, SkillPreset } from "../../master/battle/type/SkillPreset";
import { CommandActionType, TargetType } from "./TargetType";

/** 全てのアクションが共通で持つべき最小構成 */
export interface BaseAction {
    commandId: CommandActionType;
    actorMasterId: number;
    actorInstanceId: number;
    actorName: string;      // 実行者の名前（ログ出力用）
    skillId: SkillId;       // 実行するスキルのID
    targetInstanceIds: number[]; 
}

/** 通常のプレイヤー選択による詳細なアクション */
export type BattleAction = BaseAction & {
    skill: SkillPreset;     // プレイヤー選択時はマスタデータも保持
    target: TargetSpecifier; // 詳細なターゲット指定情報
};

/** 状態異常などによる「書き換えられた」アクション */
// BaseAction と同じ構造にする（または必要最低限にする）
export type StrangeAction = BaseAction;

export type TargetSpecifier =
    | { type: typeof TargetType.SINGLE_ENEMY, actorInstanceId: number, enemyInstanceId: number }
    | { type: typeof TargetType.GROUP_ENEMY, actorInstanceId: number, ids: number[] }
    | { type: typeof TargetType.ALL_ENEMIES, actorInstanceId: number }
    | { type: typeof TargetType.SINGLE_ALLY; actorInstanceId: number }
    | { type: typeof TargetType.SELF_AND_SINGLE_ALLY; actorInstanceId: number }
    | { type: typeof TargetType.ALL_ALLIES, actorInstanceId: number }
    | { type: typeof TargetType.SELF, actorInstanceId: number };


export type BattleInput = {
    commandId: CommandActionType;
    actorMasterId: number;
    actorInstanceId: number;
    actorName: string;
    enemy: BattleActor[];
    skillId: SkillId;
    targetId: number;
};


export type BattleActor = {
    actorMasterId: number;
    instanceId: number;
    name: string;
    alive: boolean;
};

export const BattlerSide = {
    ALLY: "ALLY", ENEMY: "ENEMY",
} as const;
export type BattlerSide = typeof BattlerSide[keyof typeof BattlerSide];

export const ActionKind = {
    SKILL: "SKILL", ITEM: "ITEM"
} as const;
export type ActionKind = typeof ActionKind[keyof typeof ActionKind]

export type LevelGrowthTable = Record<number, Partial<BaseStats>>;
// レベルごとの成長値を保持 {1: {hp:5, mp:2, ...}, 2: {...}}
