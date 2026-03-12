// src/renderer/screens/ScreenPort.ts

import { WorldDefinition } from "../game/map/builder/interface/definition/WorldDefinition";
import { YesNoEvent } from "../../shared/events/ui/YesNoEvent";
import { MainScreenType, OverlayScreenType } from "../../shared/type/screenType";
import { OverlayInstanceMap, OverlayPayloadMap } from "../../renderer/screens/interface/overlay/overlayPayloadMap";
import { MainScreenInstanceMap, MainScreenPayloadMap } from "../../renderer/screens/interface/screen/MainScreenPayloadMap";
import { ZoneController } from "../../renderer/game/map/zone/ZoneController";

export interface ScreenPort {
    changeMain<K extends keyof MainScreenInstanceMap>(type: K, payload: MainScreenPayloadMap[K]): void;
    pushOverlay<K extends keyof OverlayPayloadMap>(type: K, payload: OverlayPayloadMap[K]): void;
    popOverlay(): void;
    popAllOverlay(): void;
    openYesNo(event: YesNoEvent): void;
    setWorld(screen: MainScreenType, def: WorldDefinition,zoneController: ZoneController): void;
    getOverlayScreen<K extends keyof OverlayInstanceMap>(type: K): OverlayInstanceMap[K];
    getMainScreen<K extends keyof MainScreenInstanceMap>(type: K): MainScreenInstanceMap[K];
    isOverlayOpen(type: OverlayScreenType): boolean;
    lockInput(lock: boolean): void;
}
