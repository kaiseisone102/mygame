// src/shared/save/createInitialSaveData.ts

import { DEFAULT_COLLECTED_ITEMS, DEFAULT_EVENTFLAG, DEFAULT_PLAYER_BASE_STATS, DEFAULT_PLAYER_EXP, DEFAULT_PLAYER_GOLD, DEFAULT_PLAYER_LEVEL, DEFAULT_PLAYER_NAME, DEFAULT_START_MAP_ID, DEFAULT_START_POSITION_BY_WORLD, SAVE_VERSION } from "../data/playerConstants";
import { SaveData } from "./SaveData";

export function createInitialSaveData(playerName?: string): SaveData {
    return {
        version: SAVE_VERSION,
        playerName: playerName && playerName.trim() !== ""
            ? playerName
            : DEFAULT_PLAYER_NAME,
        level: DEFAULT_PLAYER_LEVEL,
        exp: DEFAULT_PLAYER_EXP,
        gold: DEFAULT_PLAYER_GOLD,

        baseStats: DEFAULT_PLAYER_BASE_STATS,

        statusEffects: [],
        skills: [],
        equipment: {},
        items: {},

        currentMapId: DEFAULT_START_MAP_ID,
        where: structuredClone(DEFAULT_START_POSITION_BY_WORLD),

        abilities: { swim: false },

        eventFlags: structuredClone(DEFAULT_EVENTFLAG),
        collectedItems: structuredClone(DEFAULT_COLLECTED_ITEMS),

        playerPos: structuredClone(DEFAULT_START_POSITION_BY_WORLD),

        battleReturn: undefined,

        party: []
    };
}
