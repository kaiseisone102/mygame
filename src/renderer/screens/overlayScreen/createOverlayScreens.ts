// src/renderer/screens/overlayScreens/ItemScreens.ts

import { OverlayScreenType } from "../../../shared/type/screenType";
import { InventoryOverlay } from "./screen/InventoryOverlay";
import { YesNoOverlay } from "./screen/YesNoOverlay";
import { OptionsOverlay } from "./screen/OptionsOverlay";
import { AttackTargetOverlay } from "../battleScene/overlayScreen/AttackTargetOverlay";
import { MessageLogOverlay } from "./screen/MessageLogOverlay";
import { BattleLogOverlay } from "../battleScene/overlayScreen/BattleLogOverlay";
import { ItemSelectOverLayInBattle } from "../battleScene/overlayScreen/ItemSelectOverLayInBattle";
import { BattleBasicCommandOverlay } from "../battleScene/overlayScreen/BattleBasicCommandOverlay";
import { InputNameOverlay } from "./screen/InputNameOverlay";
import { MagicSelectOverlay } from "../battleScene/overlayScreen/MagicSelectOverlay";
import { AlliesStatusOverlay } from "../battleScene/overlayScreen/AlliesStatusOverlay";
import { BattleTurnDisplayOverlay } from "../battleScene/overlayScreen/BattleTurnDisplayOverlay";
import { LevelUpOverlay } from "../battleScene/overlayScreen/LevelUpOverlay";

export function createOverlayScreens() {
    return {
        [OverlayScreenType.OPTIONS]: new OptionsOverlay(),
        [OverlayScreenType.INPUT_NAME_OVERLAY]: new InputNameOverlay(),
        [OverlayScreenType.YES_NO_OVERLAY]: new YesNoOverlay(),
        [OverlayScreenType.INVENTORY]: new InventoryOverlay(),
        [OverlayScreenType.MESSAGE_LOG]: new MessageLogOverlay(),
        [OverlayScreenType.BATTLE_BASIC_COMMAND_OVERLAY]: new BattleBasicCommandOverlay(),
        [OverlayScreenType.ATTACK_TARGET_OVERLAY]: new AttackTargetOverlay(),
        [OverlayScreenType.MAGIC_SELECT_OVERLAY]: new MagicSelectOverlay(),
        [OverlayScreenType.ITEM_SELECT_OVERLAY_IN_BATTLE]: new ItemSelectOverLayInBattle(),
        [OverlayScreenType.BATTLE_LOG]: new BattleLogOverlay(),
        [OverlayScreenType.ALLIES_STATUS_OVERLAY]: new AlliesStatusOverlay(),
        [OverlayScreenType.BATTLE_TURN_DISPLAY]: new BattleTurnDisplayOverlay(),
        [OverlayScreenType.LEVEL_UP_OVERLAY]: new LevelUpOverlay(),
    } as const;
}