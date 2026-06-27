// src/shared/master/item/MaterialPreset.ts

/**
 * マテリアル(素材)ID。
 * 消費アイテム(ItemPreset)とは別系統。
 * 現状はコレクション要素として「持っているだけ」。スタック(個数)で保持する。
 * 将来クラフト等に使う場合はここを起点に拡張する。
 */
export const MaterialId = {
    SLIME_GEL: "SLIME_GEL",
    BEAST_FANG: "BEAST_FANG",
    IRON_ORE: "IRON_ORE",
    MAGIC_STONE: "MAGIC_STONE",
    ANCIENT_COIN: "ANCIENT_COIN",
} as const;
export type MaterialId = typeof MaterialId[keyof typeof MaterialId];

export type MaterialPreset = {
    id: MaterialId;
    name: string;
    description: string;
};

export const MaterialPresets: Record<MaterialId, MaterialPreset> = {
    [MaterialId.SLIME_GEL]: {
        id: MaterialId.SLIME_GEL,
        name: "スライムゼリー",
        description: "スライムが残したぷるぷる。集めると何かに使える…かも。",
    },
    [MaterialId.BEAST_FANG]: {
        id: MaterialId.BEAST_FANG,
        name: "けものの牙",
        description: "獣型のモンスターから取れる鋭い牙。",
    },
    [MaterialId.IRON_ORE]: {
        id: MaterialId.IRON_ORE,
        name: "鉄鉱石",
        description: "武具の材料になる鉱石。ずっしり重い。",
    },
    [MaterialId.MAGIC_STONE]: {
        id: MaterialId.MAGIC_STONE,
        name: "魔石",
        description: "魔力をうっすら帯びた石。ほのかに光る。",
    },
    [MaterialId.ANCIENT_COIN]: {
        id: MaterialId.ANCIENT_COIN,
        name: "古びたコイン",
        description: "見たことのない刻印のコイン。コレクター垂涎の品。",
    },
};

/** id 文字列からの逆引き */
export const MaterialPresetsById: Record<string, MaterialPreset> = MaterialPresets;

/** その id がマテリアルか */
export function isMaterialId(id: string): id is MaterialId {
    return id in MaterialPresets;
}
