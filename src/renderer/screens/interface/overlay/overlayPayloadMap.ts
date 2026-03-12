// src/renderer/screens/interface/overlay/OverlayPayloadMap.ts

import { AlliesStatusPayload } from "../../../../renderer/screens/battleScene/overlayScreen/AlliesStatusOverlay";
import { AttackTargetPayload } from "../../../../renderer/screens/battleScene/overlayScreen/AttackTargetOverlay";
import { BasicCommandPayload, CommandSelectedPayload } from "../../../../renderer/screens/battleScene/overlayScreen/BattleBasicCommandOverlay";
import { BattleTurnPayload } from "../../../../renderer/screens/battleScene/overlayScreen/BattleTurnDisplayOverlay";
import { LevelUpPayload } from "../../../../renderer/screens/battleScene/overlayScreen/LevelUpOverlay";
import { MessageLogEvent } from "../../../../renderer/screens/overlayScreen/screen/MessageLogOverlay";
import { YesNoEvent } from "../../../../shared/events/ui/YesNoEvent";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { OverlayScreen } from "./OverLayScreens";

export type OverlayPayloadMap = {
    [OverlayScreenType.ATTACK_TARGET_OVERLAY]: AttackTargetPayload;
    [OverlayScreenType.YES_NO_OVERLAY]: YesNoEvent;
    [OverlayScreenType.SKILL_SELECT_OVERLAY]: CommandSelectedPayload;
    [OverlayScreenType.MESSAGE_LOG]: MessageLogEvent;
    [OverlayScreenType.OPTIONS]: undefined;
    [OverlayScreenType.SANDSTORMOVERLAY]: undefined;
    [OverlayScreenType.BATTLE_BASIC_COMMAND_OVERLAY]: BasicCommandPayload;
    [OverlayScreenType.BATTLE_LOG]: undefined;
    [OverlayScreenType.INPUT_NAME_OVERLAY]: undefined;
    [OverlayScreenType.ITEM_SELECT_OVERLAY_IN_BATTLE]: undefined;
    [OverlayScreenType.INVENTORY]: undefined;
    [OverlayScreenType.ALLIES_STATUS_OVERLAY]: AlliesStatusPayload;
    [OverlayScreenType.BATTLE_TURN_DISPLAY]: BattleTurnPayload;
    [OverlayScreenType.LEVEL_UP_OVERLAY]: LevelUpPayload[];
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