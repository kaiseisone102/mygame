// src/shared/type/equipment/EquipSlot.ts

/**
 * 装備スロット(5枠)。
 * 1キャラにつき各スロット1つまで装備できる。
 */
export const EquipSlot = {
    WEAPON: "WEAPON",       // 武器
    SHIELD: "SHIELD",       // 盾
    HEAD: "HEAD",           // 頭
    BODY: "BODY",           // 鎧・体
    ACCESSORY: "ACCESSORY", // 装飾品
} as const;
export type EquipSlot = typeof EquipSlot[keyof typeof EquipSlot];

/** 全スロットの一覧(UI のループ用) */
export const EQUIP_SLOT_ORDER: readonly EquipSlot[] = [
    EquipSlot.WEAPON,
    EquipSlot.SHIELD,
    EquipSlot.HEAD,
    EquipSlot.BODY,
    EquipSlot.ACCESSORY,
];

/** スロットの表示名(日本語) */
export const EQUIP_SLOT_LABEL: Record<EquipSlot, string> = {
    WEAPON: "武器",
    SHIELD: "盾",
    HEAD: "頭",
    BODY: "体",
    ACCESSORY: "装飾",
};

/** あるキャラが着けている装備の対応表(スロット→装備ID)。未装備のスロットはキー無し。 */
export type EquipmentMap = Partial<Record<EquipSlot, string>>;
