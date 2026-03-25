import { SkillId } from "../../master/battle/type/SkillPreset";
import { BattleActor } from "../battle/BattleAction";
import { TargetSide } from "../battle/skill/skillFormula";
import { TargetType } from "../battle/TargetType";

export type SkillSelectedPayload = {
    skillId: SkillId,
    allies: BattleActor[],
    enemies: BattleActor[],
    target: {
        type: TargetType,
        side: TargetSide
    };
};

export type SkillItem = {
    skillId: SkillId;
    name: string;
    description: string;
    mpCost: number;
    target: {
        type: TargetType,
        side: TargetSide
    };
};

export type SkillSelectPayload = {
    actorInstanceId: number;
    skillItems: SkillItem[];
    allies: BattleActor[],
    enemies: BattleActor[],
}

export type FieldMagicPayload = {
    actorInstanceId: number; // 誰が魔法を使おうとしているか
    skillIds: SkillId[];
    allies: {                // パーティ全員の情報（ターゲット選択用）
        actorMasterId: number;
        instanceId: number;
        name: string;
        hp: number;
        maxHp: number;
        alive: boolean;
    }[];
};