import { BattleAction } from "../../../shared/type/battle/BattleAction";

class BattleExecutor {
    execute(action: BattleAction) {
        switch (action.targetType) {
            case "SINGLE_ENEMY":
                this.attackEnemy(action.targetEnemyId!);
                break;

            case "ALL_ENEMIES":
                this.enemies.forEach(e => {
                    if (e.alive) this.attackEnemy(e.id);
                });
                break;
        }
    }
}
