// src/renderer/screens/router/useCase/world/BattleStartedUseCase.ts

import { createDummyAllies } from "../../../../../renderer/game/battle/core/BattleState";
import { BattlerFactory } from "../../../../../renderer/game/battle/enemy/factory/createEnemy";
import { EncounterRepository } from "../../../../../renderer/game/battle/enemy/repository/EncounterRepository";
import { EnemyRepository } from "../../../../../renderer/game/battle/enemy/repository/EnemyRepository";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../../renderer/router/WorldEvent";
import { EnemyKey } from "../../../../../shared/Json/enemy/EnemyTemplateJson";
import { BiomeId } from "../../../../../shared/type/battle/enemy/BiomeId";

// BattleStartedUseCase は「画面上のワールド状態」を基準にする
/**
 * BattleStartedUseCase の責務
 * ワールド → バトルへの 状態遷移
 * 戦闘に必要な 初期データ生成
 */
export class BattleStartedUseCase {
    constructor(
        private enemyRepo: EnemyRepository,
        private encounterRepo: EncounterRepository,
        private battlerFactory: BattlerFactory,
        private emitWorld: (e: WorldEvent) => void,
        private emitUI: (e: AppUIEvent) => void,
    ) { }

    execute(biomeId: BiomeId) {
        // 1.エリアから敵ID取得
        const enemyIds = this.encounterRepo.getEnemyIds(biomeId);
        console.log("enemyIds", enemyIds);
        // 2.テンプレ取得
        const templates = enemyIds.map((id: EnemyKey) =>
            this.enemyRepo.get(id)
        );
        console.log("biomeId", biomeId);
        console.log("templates", templates);
        // 3.Battler生成
        const allies = createDummyAllies();
        const enemies = templates.map(temp =>
            this.battlerFactory.createEnemy(temp)
        );
        console.log("enemies", enemies);
        // 4.イベント通知
        this.emitWorld({
            type: "BATTLE_STARTED", payload: {
                allies,
                enemies,
                biomeId
            }
        });
    }
}
