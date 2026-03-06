// src/renderer/game/battle/useCase/commandToAction.ts
import { BattleCommandId } from "@/shared/domain/battleCommandId";
import { BattleAction } from "@/shared/type/battle/BattleAction";
import { CommandActionType } from "@/shared/type/battle/TargetType";

/**
 * BattleCommandId から BattleAction を生成
 * @param commandId - コマンド ID
 * @param actorId - 行動者 ID
 * @param targetId - 単体攻撃対象 (必要な場合)
 * @returns BattleAction
 */
export function commandToAction(
    commandId: CommandActionType,
    actorId: string,
    targetId?: string
): BattleAction {
    switch (commandId) {
        case CommandActionType.ATTACK:
            return {
                type: "ATTACK",
                actorId,
                targetType: targetId !== undefined ? "SINGLE_ENEMY" : "ALL_ENEMIES",
                targetEnemyId: targetId,
                weaponId: "default", // 仮: 後で装備から取得
            };

        case CommandActionType.MAGIC:
            return {
                type: "MAGIC",
                actorId,
                spellId: "fireball", // 仮
                targetType: targetId !== undefined ? "SINGLE_ENEMY" : "ALL_ENEMIES",
                targetEnemyId: targetId,
            };

        case CommandActionType.DEFENCE:
            return {
                type: "DEFENCE",
                actorId,
            };

        case CommandActionType.ITEM:
            return {
                type: "ITEM",
                actorId,
                itemId: "potion",
                targetActorId: targetId,
            };

        case CommandActionType.RUN:
            return {
                type: "RUN",
                actorId,
            };

        default:
            throw new Error("Unknown BattleCommandId: " + commandId);
    }
}
