// src/renderer/screens/overlayScreens/ItemScreens.ts

import { SkillRepository } from "../../../shared/master/battle/SkillRepository";
import { OverlayScreenType } from "../../../shared/type/screenType";
import { AlliesStatusOverlay } from "../battleScene/overlayScreen/AlliesStatusOverlay";
import { BattleBasicCommandOverlay } from "../battleScene/overlayScreen/BattleBasicCommandOverlay";
import { BattleLogOverlay } from "../battleScene/overlayScreen/BattleLogOverlay";
import { BattleTurnDisplayOverlay } from "../battleScene/overlayScreen/BattleTurnDisplayOverlay";
import { ItemSelectOverLayInBattle } from "../battleScene/overlayScreen/ItemSelectOverLayInBattle";
import { LevelUpOverlay } from "../battleScene/overlayScreen/LevelUpOverlay";
import { SelectTargetOverlay } from "../battleScene/overlayScreen/SelectTargetOverlay";
import { SkillSelectOverlay } from "../battleScene/overlayScreen/SkillSelectOverlay";
import { FieldCommandOverlay } from "./screen/FieldCommandOverlay";
import { InputNameOverlay } from "./screen/InputNameOverlay";
import { InventoryOverlay } from "./screen/InventoryOverlay";
import { MessageLogOverlay } from "./screen/MessageLogOverlay";
import { OptionsOverlay } from "./screen/OptionsOverlay";
import { SandStormOverlay } from "./screen/SandStormOverlay";
import { ShopOverlay } from "./screen/ShopOverlay";
import { SlotSelectOverlay } from "./screen/SlotSelectOverlay";
import { TitleOverlay } from "./screen/TitleOverlay";
import { YesNoOverlay } from "./screen/YesNoOverlay";

export function createOverlayScreens(skillRepo: SkillRepository) {
    return {
        [OverlayScreenType.OPTIONS]: new OptionsOverlay(),
        [OverlayScreenType.FIELD_COMMAND]: new FieldCommandOverlay(skillRepo),
        [OverlayScreenType.SANDSTORM_OVERLAY]: new SandStormOverlay(),
        [OverlayScreenType.TITLE_OVERLAY]: new TitleOverlay(),
        [OverlayScreenType.SLOT_SELECT]: new SlotSelectOverlay(),
        [OverlayScreenType.INPUT_NAME_OVERLAY]: new InputNameOverlay(),
        [OverlayScreenType.YES_NO_OVERLAY]: new YesNoOverlay(),
        [OverlayScreenType.INVENTORY]: new InventoryOverlay(),
        [OverlayScreenType.MESSAGE_LOG]: new MessageLogOverlay(),
        [OverlayScreenType.BATTLE_BASIC_COMMAND_OVERLAY]: new BattleBasicCommandOverlay(),
        [OverlayScreenType.SELECT_TARGET_OVERLAY]: new SelectTargetOverlay(),
        [OverlayScreenType.SKILL_SELECT_OVERLAY]: new SkillSelectOverlay(),
        [OverlayScreenType.ITEM_SELECT_OVERLAY_IN_BATTLE]: new ItemSelectOverLayInBattle(),
        [OverlayScreenType.BATTLE_LOG]: new BattleLogOverlay(),
        [OverlayScreenType.ALLIES_STATUS_OVERLAY]: new AlliesStatusOverlay(),
        [OverlayScreenType.BATTLE_TURN_DISPLAY]: new BattleTurnDisplayOverlay(),
        [OverlayScreenType.LEVEL_UP_OVERLAY]: new LevelUpOverlay(),
        [OverlayScreenType.SHOP]: new ShopOverlay(),
    } as const;
}