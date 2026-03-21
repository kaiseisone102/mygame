// src/renderer/game/battle/logic/targets/TargetResolver.ts

import { Battler } from "../../core/Battler";
import { BattleState } from "../../core/BattleState";
import { TargetSpecifier, BattlerSide } from "../../../../../shared/type/battle/BattleAction";
import { TargetType } from "../../../../../shared/type/battle/TargetType";

export class TargetResolver {
    /**
     * 指定されたターゲット定義（spec）を解析し、具体的な Battler 配列を返します。
     */
    static resolve(spec: TargetSpecifier, state: BattleState, currentActorInstanceId: number): Battler[] {
        const allBattlers = [...state.allies, ...state.enemies];

        // 1. 実行者（executor）を特定
        const executorId = spec.actorInstanceId ?? currentActorInstanceId;
        const executor = allBattlers.find(b => b.instanceId === executorId);
        if (!executor) return [];

        // 2. 陣営の定義
        const isAllySide = executor.side === BattlerSide.ALLY;
        const teamSide = isAllySide ? state.allies : state.enemies;
        const opponentSide = isAllySide ? state.enemies : state.allies;

        switch (spec.type) {
            case TargetType.SINGLE_ENEMY: {
                // 敵単体：指定IDのバトラーが「生きている」かつ「相手チーム」にいるか
                if (!spec.enemyInstanceId) return [];
                const target = allBattlers.find(b => b.instanceId === spec.enemyInstanceId);
                return (target && target.alive && target.side !== executor.side) ? [target] : [];
            }

            case TargetType.GROUP_ENEMY: {
                 // 指定されたIDリストのうち、相手チームに属するもの
               if (!spec.ids) return [];
                return spec.ids
                    .map(id => allBattlers.find(b => b.instanceId === id))
                    .filter((b): b is Battler => !!b && b.alive && b.side !== executor.side);
            }

            case TargetType.ALL_ENEMIES:
                     // 敵全体：相手チームの生存者全員
           return opponentSide.filter(b => b.alive);

            case TargetType.SINGLE_ALLY: {
               // 味方単体：指定ID（または自分）が「生きている」かつ「自分チーム」にいるか
                 const targetId = spec.actorInstanceId ?? executor.instanceId; // 味方選択時もここに入る想定
                const target = allBattlers.find(b => b.instanceId === targetId);
                return (target && target.alive && target.side === executor.side) ? [target] : [];
            }

            case TargetType.ALL_ALLIES:
               // 味方全体：自分チームの生存者全員
                return teamSide.filter(b => b.alive);

            case TargetType.SELF:
                return executor.alive ? [executor] : [];

            case TargetType.SELF_AND_SINGLE_ALLY: {
                // 自分 ＋ 他の味方一人
                const otherAllyId = spec.actorInstanceId;
                const other = otherAllyId ? allBattlers.find(b => b.instanceId === otherAllyId) : undefined;
                return [executor, other].filter((b): b is Battler => !!b && b.alive);
            }

            default:
                return [];
        }
    }
}