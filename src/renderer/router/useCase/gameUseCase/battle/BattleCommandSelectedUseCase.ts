// src/renderer/router/useCase/gameUseCase/battle/BattleCommandSelectedUseCase.ts

import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { CommandSelectedPayload } from "../../../../../renderer/screens/battleScene/overlayScreen/BattleBasicCommandOverlay";
import { CommandActionType } from "../../../../../shared/type/battle/TargetType";
import { isMagicId, isTechnickId } from "../../module/isMagicId";
import { OverlayScreenType } from "../../../../../shared/type/screenType";

export class BattleCommandSelectedUseCase {

    constructor(private emitUI: (event: AppUIEvent) => void) { }

    execute(payload: CommandSelectedPayload) {

        // スキルを魔法か技で絞る
        const filteredSkills = payload.commandId === CommandActionType.MAGIC
            ? payload.phaseBase.skills.filter(isMagicId)
            : payload.phaseBase.skills.filter(isTechnickId);
        // 技/魔法未習得ならログ出して処理終了
        if (filteredSkills.length === 0) {
            this.emitUI({ type: "ADD_BATTLE_LOG", message: `${payload.phaseBase.actorName}は${payload.commandId === CommandActionType.MAGIC ? "魔法" : "技"}を覚えていない！` });
            return;
        }
        // 選択可能なスキルがあればスキル選択オーバーレイを表示
        this.emitUI({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.SKILL_SELECT_OVERLAY, payload: { phaseBase: { ...payload.phaseBase, skills: filteredSkills }, commandId: payload.commandId } });
    }
}