// src/renderer/screens/interface/overlay/OverlayPayloadMap.ts

import { MessageLogEvent } from "../../../../renderer/screens/overlayScreen/screen/MessageLogOverlay";
import { AttackTargetPayload } from "../../../../renderer/screens/battleScene/overlayScreen/AttackTargetOverlay";
import { YesNoEvent } from "../../../../shared/events/ui/YesNoEvent";
import { SkillPreset } from "../../../../shared/master/battle/type/SkillPreset";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { OverlayScreen } from "./OverLayScreens";
import { BattleBasicCommandPayload } from "../../../../renderer/screens/battleScene/overlayScreen/BattleBasicCommandOverlay";

export type OverlayPayloadMap = {
    [OverlayScreenType.ATTACK_TARGET_OVERLAY]: AttackTargetPayload;
    [OverlayScreenType.YES_NO_OVERLAY]: YesNoEvent;
    [OverlayScreenType.MAGIC_TARGET_OVERLAY]: SkillPreset;
    [OverlayScreenType.MESSAGE_LOG]: MessageLogEvent;
    [OverlayScreenType.OPTIONS]: undefined;
    [OverlayScreenType.BATTLE_BASIC_COMMAND_OVERLAY]: BattleBasicCommandPayload;
    [OverlayScreenType.BATTLE_LOG]: undefined;
    [OverlayScreenType.INPUT_NAME_OVERLAY]: undefined;
    [OverlayScreenType.ITEM_SELECT_OVERLAY_IN_BATTLE]: undefined;
    [OverlayScreenType.INVENTORY]: undefined;
};

// export type OverlayInstanceMap = {
//     [OverlayScreenType.ATTACK_TARGET_OVERLAY]: AttackTargetOverlay;
//     [OverlayScreenType.YES_NO_OVERLAY]: YesNoOverlay;
//     [OverlayScreenType.MAGIC_TARGET_OVERLAY]: MagicTargetOverlay;
//     [OverlayScreenType.MESSAGE_LOG]: MessageLogOverlay;
//     [OverlayScreenType.INVENTORY]: ItemOverlay;
// }

export type OverlayInstanceMap = {
    [K in keyof OverlayPayloadMap]: OverlayScreen<OverlayPayloadMap[K]>
}