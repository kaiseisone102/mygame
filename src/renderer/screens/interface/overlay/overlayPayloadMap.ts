// src/renderer/screens/interface/overlay/OverlayPayloadMap.ts

import { GoldHudPayload } from "../../overlayScreen/screen/GoldHud";
import { AlliesStatusPayload } from "../../../../renderer/screens/battleScene/overlayScreen/AlliesStatusOverlay";
import { BasicCommandPayload } from "../../../../renderer/screens/battleScene/overlayScreen/BattleBasicCommandOverlay";
import { BattleTurnPayload } from "../../../../renderer/screens/battleScene/overlayScreen/BattleTurnDisplayOverlay";
import { LevelUpPayload } from "../../../../renderer/screens/battleScene/overlayScreen/LevelUpOverlay";
import { InputNamePayload } from "../../../../renderer/screens/overlayScreen/screen/InputNameOverlay";
import { MessageLogEvent } from "../../../../renderer/screens/overlayScreen/screen/MessageLogOverlay";
import { ShopPayload } from "../../../../renderer/screens/overlayScreen/screen/ShopOverlay";
import { YesNoEvent } from "../../../../shared/events/ui/YesNoEvent";
import { FieldMagicPayload, SkillSelectPayload } from "../../../../shared/type/payload/battle";
import { OverlayScreenType } from "../../../../shared/type/screenType";
import { SelectTargetPayload } from "../../battleScene/overlayScreen/SelectTargetOverlay";
import { OverlayScreen } from "./OverLayScreens";

export type OverlayPayloadMap = {
    [OverlayScreenType.SELECT_TARGET_OVERLAY]: SelectTargetPayload;
    [OverlayScreenType.YES_NO_OVERLAY]: YesNoEvent;
    [OverlayScreenType.SKILL_SELECT_OVERLAY]: SkillSelectPayload;
    [OverlayScreenType.MESSAGE_LOG]: MessageLogEvent;
    [OverlayScreenType.FIELD_COMMAND]: FieldMagicPayload[];
    [OverlayScreenType.OPTIONS]: undefined;
    [OverlayScreenType.SANDSTORM_OVERLAY]: undefined;
    [OverlayScreenType.TITLE_OVERLAY]: undefined;
    [OverlayScreenType.SLOT_SELECT]: undefined;
    [OverlayScreenType.BATTLE_BASIC_COMMAND_OVERLAY]: BasicCommandPayload;
    [OverlayScreenType.BATTLE_LOG]: undefined;
    [OverlayScreenType.INPUT_NAME_OVERLAY]: InputNamePayload;
    [OverlayScreenType.ITEM_SELECT_OVERLAY_IN_BATTLE]: undefined;
    [OverlayScreenType.INVENTORY]: undefined;
    [OverlayScreenType.EQUIPMENT]: undefined;
    [OverlayScreenType.ALLIES_STATUS_OVERLAY]: AlliesStatusPayload;
    [OverlayScreenType.BATTLE_TURN_DISPLAY]: BattleTurnPayload;
    [OverlayScreenType.LEVEL_UP_OVERLAY]: LevelUpPayload[];
    [OverlayScreenType.SHOP]: ShopPayload;
    [OverlayScreenType.GoldHud]: GoldHudPayload;
};

// export type OverlayInstanceMap = {
//     [OverlayScreenType.SELECT_TARGET_OVERLAY]: AttackTargetOverlay;
//     [OverlayScreenType.YES_NO_OVERLAY]: YesNoOverlay;
//     [OverlayScreenType.MAGIC_TARGET_OVERLAY]: MagicTargetOverlay;
//     [OverlayScreenType.MESSAGE_LOG]: MessageLogOverlay;
//     [OverlayScreenType.INVENTORY]: ItemOverlay;
// }

export type OverlayInstanceMap = {
    [K in keyof OverlayPayloadMap]: OverlayScreen<OverlayPayloadMap[K]>
}