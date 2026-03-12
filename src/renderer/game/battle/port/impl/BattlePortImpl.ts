import { BattleInput } from "../../../../../renderer/router/useCase/gameUseCase/battle/BattleInputUseCase";
import { BattleAI, BattlePort } from "../BattlePort";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { BattleManager } from "../../core/BattleManager";
import { ItemPresetsById } from "../../../../../shared/master/battle/ItemPreset";
import { SkillPreset } from "../../../../../shared/master/battle/type/SkillPreset";
import { convertItemToSkill } from "../../../../../shared/master/item/convertItemToSkill";
import { BattleEnemy } from "../../../../../renderer/screens/battleScene/overlayScreen/AttackTargetOverlay";
import { SkillItem } from "../../../../../renderer/screens/battleScene/overlayScreen/SkillSelectOverlay";

export class BattlePortImpl implements BattlePort {

    private resolver?: (input: BattleInput) => void;

    constructor(
        private emitUI: (e: AppUIEvent) => void,
        private ai: BattleAI,
        private manager: BattleManager
    ) { }

    async requestCommand(actorTemplateId: number, actorInstanceId: number, actorName: string, skills: SkillItem[], enemies: BattleEnemy[]): Promise<BattleInput> {
        // 🎮 プレイヤーの場合
        if (this.isPlayer(actorInstanceId)) {
            console.log(`requestCommand wait for [${actorName}] input`);
            return new Promise(resolve => {
                this.resolver = resolve;
                // UI 入力スタート通知(バトルスクリーンoverlayを show)
                this.emitUI({
                    type: "REQUEST_COMMAND",
                    payload: {
                        actorTemplateId,
                        actorInstanceId,
                        actorName,
                        skills,
                        enemies
                    }
                });
            });
        }

        // 🤖 AIの場合
        return this.ai.decide(actorTemplateId, actorInstanceId, this.getState());
    }
    // 入力完了時に呼ばれる
    resolvePlayerInput(input: BattleInput) {
        if (this.resolver) {
            this.resolver(input);
            this.resolver = undefined;
        }
    }

    isPlayer(actorInstanceId: number): boolean {
        return this.manager.isPlayer(actorInstanceId);
    }

    getState() {
        return this.manager.getState();
    }

    /**
     * バトルログ送信用ヘルパー
     * @param message バトルログに表示
     */
    addBattleLog(message: string) {
        this.emitUI({ type: "ADD_BATTLE_LOG", message, });
    }

    getSkillFromItem(itemId: string): SkillPreset | undefined {
        const item = ItemPresetsById[itemId];
        if (!item) return undefined;

        return convertItemToSkill(item);
    }
}
