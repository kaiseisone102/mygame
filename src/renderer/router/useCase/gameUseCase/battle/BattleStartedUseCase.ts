// src/renderer/screens/router/useCase/world/BattleStartedUseCase.ts

import { WorldEvent } from "../../../../../renderer/router/WorldEvent";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { BattleScenePayload } from "../../../../../renderer/screens/battleScene/battleScene";

// BattleStartedUseCase は「画面上のワールド状態」を基準にする
/**
 * BattleStartedUseCase の責務
 * ワールド → バトルへの 状態遷移
 * 戦闘に必要な 初期データ生成
 */
export class BattleStartedUseCase {
    constructor(
        // private encounterRepo: EncounterRepository,
        // private enemyRepo: EnemyRepository,
        // private battlerFactory: BattlerFactory,
        // private battleContext: BattleContext,
        private emitWorld: (e: WorldEvent) => void,
        private emitUI: (e: AppUIEvent) => void,
    ) { }

    execute() { //areaId: string
        // // ① エリアから敵ID取得
        // const enemyIds = this.encounterRepo.getEnemyIds(areaId);

        // // ② テンプレ取得
        // const templates = enemyIds.map(id =>
        //     this.enemyRepo.get(id)
        // );

        // // ③ Battler生成
        // const enemies = templates.map(t =>
        //     this.battlerFactory.createEnemy(t)
        // );

        // // ④ 戦闘開始
        // this.battleContext.start(enemies);

        const dummyPayload: BattleScenePayload = { battleBasicCommand: { actorName: "HeroA", enemies: [{ id: 101, name: "slimeZ", alive: true }] } };
        // // ⑤ イベント通知
        this.emitWorld({ type: "BATTLE_STARTED", payload: dummyPayload });
    }
}

// createEnemy(template: EnemyTemplateJson): Battler {
//     return new Battler({
//         id: template.id,
//         name: template.name,
//         side: BattlerSide.ENEMY,
//         level: template.level,
//         exp: template.exp,
//         baseStats: template.baseStats,
//         growthTable: template.growthTable,
//         statModifier: template.statModifier,
//         skills: template.skills,
//         traits: template.traits.map(t => TraitPresets[t]),
//         aiType: AiType[template.aiType as keyof typeof AiType]
//     });
// }