// src/renderer/game/map/MapData/MapZones.ts

import { MessageLogOverlayController } from "../../../../renderer/screens/overlayScreen/screen/controller/MessageLogOverlayController";
import {
    OLD_MAN_HELLO_STRANGER, FOREST_TEMPLE_ENTRANCE_SIGN, FOREST_KEEPER_GO_AHEAD, WORLD_MAP_NEAR_FOREST_TEMPLE_SIGN, WORLD_MAP_TRIGER_EVENT_FOREST_TEMPLE,
    WORLD_MAP_NEAR_NO_FEATURE_TOWN
} from "../../../../shared/data/message/messageData";
import { EnvironmentData } from "../talkNPC/interface/EnvironmentData";
import { FieldItem, ItemData } from "../talkNPC/ItemData";
import { NpcData } from "../talkNPC/NPCData";
import { SignData } from "../talkNPC/SignData";
import { ZoneTile } from "../../../../shared/type/ZoneTileDto";
import { ZoneType } from "../../../../shared/type/ZoneType";
import { MapId } from "../../../../shared/type/MapId";
import { ImageKey } from "../../../../shared/type/ImageKey";
import { AppDirection } from "../../../../shared/type/PlayerState";

export interface MapData {
    zones: MapZoneGroups;
    npcs?: NpcData[];
    signs?: SignData[];
    items?: ItemData[];
    environment?: EnvironmentData;
}

// マップごとの Zone をまとめたデータ
export interface MapZoneGroups {
    entry: ZoneTile[];
    fieldEnemy: ZoneTile[];
    ramdomEnemyEncount: ZoneTile[];
    areas: ZoneTile[];
    triggers?: ZoneTile[];   // イベント発火ゾーン
    warps?: ZoneTile[];      // ワープゾーン
    obstacles?: ZoneTile[];  // トラップ・ギミック
}

// 例：複数マップのデータ
export function createMapsEvent(): Record<MapId, MapData> {
    return {
        WORLD_MAP: {
            zones: {
                entry: [
                    {
                        tx: 10, ty: 20, w: 2, h: 2, block: false, type: ZoneType.ENTRY, image: ImageKey.TOWN_ICON,
                    },
                    {
                        tx: 30, ty: 15, w: 3, h: 3, block: false, type: ZoneType.ENTRY, image: ImageKey.TOWN_ICON,
                    }
                ],

                fieldEnemy: [
                    {
                        tx: 5, ty: 5, w: 1, h: 1, block: true, type: ZoneType.FIELD_ENEMY, image: ImageKey.ENEMY_ICON,
                    }
                ],

                ramdomEnemyEncount: [
                    {
                        tx: 5, ty: 5, w: 10, h: 10, block: false, type: ZoneType.RANDOM_ENEMY_ENCOUNT,
                        encounter: {
                            encounterRate: 0.5, // エンカウント率が低いゾーン
                            entries: [
                                { enemyId: "SLIME", weight: 60, min: 1, max: 3 },
                                { enemyId: "BAT", weight: 30, min: 1, max: 2 },
                                { enemyId: "WOLF", weight: 10, min: 1, max: 1 }
                            ]
                        }
                    }
                ],

                areas: [
                    {
                        tx: 0, ty: 0, w: 50, h: 50, block: false, type: ZoneType.WALKABLE_ZONE, image: ImageKey.AREA_ICON,
                    }
                ],
                triggers: [
                    {
                        id: "ZONE_ENTER_EVENT1",
                        tx: 10, ty: 8, w: 1, h: 1, block: false, type: ZoneType.EVENT, image: ImageKey.AREA_ICON,
                        message: WORLD_MAP_TRIGER_EVENT_FOREST_TEMPLE
                    }
                ],
                warps: [
                    {
                        tx: 20, ty: 20, w: 2, h: 2, block: false, type: ZoneType.WARP, image: ImageKey.AREA_ICON,
                    }
                ],
                obstacles: [
                    {
                        tx: 13, ty: 12, w: 1, h: 1, block: true, type: ZoneType.TRAP, image: ImageKey.AREA_ICON,
                    }
                ],

            },

            npcs: [
                {
                    tx: 12, ty: 18, direction: AppDirection.DOWN,
                    image: ImageKey.PLAYER_STAND_LEFT, message: OLD_MAN_HELLO_STRANGER,
                    onInteract: async (overlay: MessageLogOverlayController) => {
                        await overlay.showMessages([OLD_MAN_HELLO_STRANGER]);
                    }
                }
            ],
            signs: [
                {
                    tx: 15, ty: 20, facing: AppDirection.UP,
                    image: ImageKey.WOODEN_SIGN, text: FOREST_TEMPLE_ENTRANCE_SIGN,
                    onRead: async (overlay: MessageLogOverlayController) => {
                        await overlay.showMessages([FOREST_TEMPLE_ENTRANCE_SIGN]);
                    }
                },
                {
                    tx: 25, ty: 10, facing: AppDirection.UP,
                    image: ImageKey.WOODEN_SIGN, text: WORLD_MAP_NEAR_NO_FEATURE_TOWN,
                    onRead: async (overlay: MessageLogOverlayController) => {
                        await overlay.showMessages([WORLD_MAP_NEAR_NO_FEATURE_TOWN]);
                    }
                }
            ],
            items: [
                { id: "WORLD_POTION_001", tx: 20, ty: 10, w: 1, h: 1, type: FieldItem.POTION, image: ImageKey.POTION_ICON },
                { id: "WORLD_GOLD_001", tx: 22, ty: 11, w: 1, h: 1, type: FieldItem.GOLD, image: ImageKey.GOLD_ICON }
            ],
            environment: {
                weather: "rain",
                timeOfDay: "day",
                background: "forest_bg"
            }
        },

        FOREST_TEMPLE: {
            zones: {
                entry: [
                    { tx: 2, ty: 3, w: 3, h: 1, block: false, type: ZoneType.TOWN, image: ImageKey.TOWN_ICON, }
                ],
                fieldEnemy: [
                    { tx: 4, ty: 4, w: 1, h: 1, block: true, type: ZoneType.FIELD_ENEMY, image: ImageKey.ENEMY_ICON, }
                ],
                ramdomEnemyEncount: [],
                areas: [
                    { tx: 0, ty: 0, w: 20, h: 20, block: false, type: ZoneType.WALKABLE_ZONE, image: ImageKey.AREA_ICON }
                ],
                triggers: [
                    {
                        id: "ZONE_ENTER_EVENT1",
                        tx: 5, ty: 5, w: 1, h: 1, block: false, type: ZoneType.EVENT, image: ImageKey.AREA_ICON,
                        message: WORLD_MAP_TRIGER_EVENT_FOREST_TEMPLE
                    }
                ],
                warps: [
                    {
                        tx: 20, ty: 20, w: 2, h: 2, block: false, type: ZoneType.WARP, image: ImageKey.AREA_ICON,
                    }
                ],
                obstacles: [
                    { tx: 8, ty: 8, w: 1, h: 1, block: true, type: ZoneType.TRAP, image: ImageKey.AREA_ICON }
                ]
            },

            npcs: [
                {
                    tx: 0, ty: 0, direction: AppDirection.DOWN,
                    image: ImageKey.PLAYER_STAND_LEFT, message: FOREST_KEEPER_GO_AHEAD,
                    onInteract: async (overlay: MessageLogOverlayController) => {
                        await overlay.showMessages([FOREST_KEEPER_GO_AHEAD]);
                    }
                }
            ],
            signs: [
                {
                    tx: 5, ty: 8, facing: AppDirection.DOWN,
                    image: ImageKey.WOODEN_SIGN, text: WORLD_MAP_NEAR_FOREST_TEMPLE_SIGN,
                    onRead: async (overlay: MessageLogOverlayController) => {
                        await overlay.showMessages([WORLD_MAP_NEAR_FOREST_TEMPLE_SIGN]);
                    }
                }
            ],
            items: [
                { id: "FOREST_POTION_001", tx: 6, ty: 6, w: 1, h: 1, type: FieldItem.MANA_POTION, image: ImageKey.AREA_ICON },
                { id: "FOREST_POTION_002", tx: 20, ty: 10, w: 1, h: 1, type: FieldItem.POTION, image: ImageKey.POTION_ICON },
                { id: "FOREST_GOLD_001", tx: 22, ty: 11, w: 1, h: 1, type: FieldItem.GOLD, image: ImageKey.GOLD_ICON }
            ],
            environment: {
                weather: "fog",
                timeOfDay: "night",
                background: "temple_bg"
            }

        },

        NO_FEATURE_TOWN: {
            zones: {
                entry: [],
                fieldEnemy: [],
                ramdomEnemyEncount: [],
                areas: []
            },
            npcs: [
                {
                    tx: 12, ty: 18, direction: AppDirection.DOWN,
                    image: ImageKey.PLAYER_STAND_LEFT, message: OLD_MAN_HELLO_STRANGER,
                    onInteract: async (overlay: MessageLogOverlayController) => {
                        await overlay.showMessages([OLD_MAN_HELLO_STRANGER]);
                    }
                }
            ],
        },

        GRAVE_CAVE: {
            zones: {
                entry: [
                    { tx: 2, ty: 3, w: 3, h: 1, block: false, type: ZoneType.TOWN, image: ImageKey.TOWN_ICON, }
                ],
                fieldEnemy: [
                    { tx: 4, ty: 4, w: 1, h: 1, block: true, type: ZoneType.FIELD_ENEMY, image: ImageKey.ENEMY_ICON, }
                ],
                ramdomEnemyEncount: [],
                areas: [
                    { tx: 0, ty: 0, w: 20, h: 20, block: false, type: ZoneType.WALKABLE_ZONE, image: ImageKey.AREA_ICON }
                ],
                triggers: [
                    {
                        id: "ZONE_ENTER_EVENT1",
                        tx: 5, ty: 5, w: 1, h: 1, block: false, type: ZoneType.EVENT, image: ImageKey.AREA_ICON,
                        message: WORLD_MAP_TRIGER_EVENT_FOREST_TEMPLE
                    }
                ],
                warps: [
                    {
                        tx: 20, ty: 20, w: 2, h: 2, block: false, type: ZoneType.WARP, image: ImageKey.AREA_ICON,
                    }
                ],
                obstacles: [
                    { tx: 8, ty: 8, w: 1, h: 1, block: true, type: ZoneType.TRAP, image: ImageKey.AREA_ICON }
                ]
            },

            npcs: [
                {
                    tx: 0, ty: 0, direction: AppDirection.DOWN,
                    image: ImageKey.PLAYER_STAND_LEFT, message: FOREST_KEEPER_GO_AHEAD,
                    onInteract: async (overlay: MessageLogOverlayController) => {
                        await overlay.showMessages([FOREST_KEEPER_GO_AHEAD]);
                    }
                }
            ],
            signs: [
                {
                    tx: 5, ty: 8, facing: AppDirection.DOWN,
                    image: ImageKey.WOODEN_SIGN, text: WORLD_MAP_NEAR_FOREST_TEMPLE_SIGN,
                    onRead: async (overlay: MessageLogOverlayController) => {
                        await overlay.showMessages([WORLD_MAP_NEAR_FOREST_TEMPLE_SIGN]);
                    }
                }
            ],
            items: [
                { id: "FOREST_POTION_001", tx: 6, ty: 6, w: 1, h: 1, type: FieldItem.MANA_POTION, image: ImageKey.AREA_ICON },
                { id: "FOREST_POTION_002", tx: 20, ty: 10, w: 1, h: 1, type: FieldItem.POTION, image: ImageKey.POTION_ICON },
                { id: "FOREST_GOLD_001", tx: 22, ty: 11, w: 1, h: 1, type: FieldItem.GOLD, image: ImageKey.GOLD_ICON }
            ],
            environment: {
                weather: "fog",
                timeOfDay: "night",
                background: "temple_bg"
            }

        },
    }
};
