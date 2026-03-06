// src/shared/save/migrateSaveData.ts
import { DEFAULT_START_POSITION_BY_WORLD } from "../data/playerConstants";
import { SaveDataV1 } from "./interface/SaveDataV1";
import { SaveDataV2 } from "./interface/SaveDataV2";
import { SaveData } from "./SaveData";

/**
 * migrateSaveData
 * ----------------
 * 過去バージョンのセーブデータを
 * 必ず最新版 SaveData に変換する
 */
export function migrateSaveData(data: any): SaveData {
    switch (data.version) {
        case 1:
            return migrateV1toV2(data as SaveDataV1);

        case 2:
            return data as SaveDataV2;

        default:
            throw new Error("Unknown save data version");
    }
}

function migrateV1toV2(v1: SaveDataV1): SaveDataV2 {
    return {
        version: 2,

        playerName: v1.playerName,
        level: v1.level,
        exp: 0,
        gold: 0,

        hp: v1.hp,
        mp: v1.mp,
        pow: 5,
        int: 5,
        def: 5,
        spd: 5,
        luc: 5,
        avo: 0,
        crt: 0,

        statusEffects: [],
        skills: [],

        equipment: {},
        items: {},

        currentMapId: v1.currentMapId,
        where: v1.where,

        abilities: { swim: false },

        eventFlags: {},
        collectedItems: {},

        playerPos: structuredClone(DEFAULT_START_POSITION_BY_WORLD),

        battleReturn: undefined,
    };
}
