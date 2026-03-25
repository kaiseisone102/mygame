import { SkillItem } from "shared/type/payload/battle";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { ItemPresetsById } from "../../../../../shared/master/battle/ItemPreset";
import { SkillPreset } from "../../../../../shared/master/battle/type/SkillPreset";
import { convertItemToSkill } from "../../../../../shared/master/item/convertItemToSkill";
import { BattleActor, combatCommandInput } from "../../../../../shared/type/battle/BattleAction";
import { BattleManager } from "../../core/BattleManager";
import { BattleAI, BattlePort } from "../BattlePort";

export class BattlePortImpl implements BattlePort {

    private resolver?: (input: combatCommandInput) => void;

    constructor(
        private emitUI: (e: AppUIEvent) => void,
        private ai: BattleAI,
        private manager: BattleManager
    ) { }

    async requestCommand(allies: BattleActor[], enemies: BattleActor[], skillItems: SkillItem[]): Promise<combatCommandInput> {
        // 🎮 プレイヤーの場合
        if (this.isPlayer(this.manager.currentActor.instanceId)) {
            console.log(`requestCommand wait for [${this.manager.currentActor.name}] input`);
            return new Promise(resolve => {
                this.resolver = resolve;
                // UI 入力スタート通知(バトルスクリーンoverlayを show)
                this.emitUI({
                    type: "REQUEST_COMMAND",
                    payload: {
                        actorMasterId: this.manager.currentActor.actorMasterId,
                        actorInstanceId: this.manager.currentActor.instanceId,
                        actorName: this.manager.currentActor.name,
                        allies,
                        skillItems,
                        enemies
                    }
                });
            });
        }

        // 🤖 AIの場合
        return this.ai.decide(this.manager.currentActor.actorMasterId, this.manager.currentActor.instanceId, this.getState());
    }
    // 入力完了時に呼ばれる
    resolvePlayerInput(input: combatCommandInput) {
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
