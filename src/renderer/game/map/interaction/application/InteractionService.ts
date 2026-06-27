// src/renderer/game/map/interaction/application/InteractionService.ts

import { OverlayScreenType } from "../../../../../shared/type/screenType";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { InteractionTarget } from "../InteractionTarget";
import { MessageRepository } from "./message/MessageRepository";
import { ShopItem } from "../../../../../renderer/screens/overlayScreen/screen/ShopOverlay";
import { EquipmentId } from "../../../../../shared/master/battle/EquipmentPreset";

export class InteractionService {

    constructor(private messageRepo: MessageRepository) { }

    createTalkEvent(messageId: string, name?: string): AppUIEvent {
        const message = this.messageRepo.getMessage(messageId) ?? "...";
        return {
            type: "PUSH_OVERLAY",
            overlay: OverlayScreenType.MESSAGE_LOG,
            payload: { name: name, messages: [message] }
        };
    }

    createShopEvent(shopId: string): AppUIEvent {

        // 1. shopId からアイテムリストを取得
        const items = this.getMasterItemsByShopId(shopId);

        return {
            type: "PUSH_OVERLAY",
            overlay: OverlayScreenType.SHOP,
            payload: { shopItems: items }
        };
    }

    private getMasterItemsByShopId(shopId: string): ShopItem[] {
        // 本来は外部 JSON 等から取得する処理。現状はダミーデータ。
        // itemId を持つ品は購入で実体が手に入る:
        //   - ItemPresetsById のキー → 道具(使えるアイテム)
        //   - EquipmentPresets のキー → 装備(そうび画面で装備できる)
        //   - MaterialPresets のキー → マテリアル
        // itemId の無い品は「フレーバー」で、購入できるが現状ゲーム上の効果は無い。
        const mockMaster: Record<string, ShopItem[]> = {
            // 一般的な「よろず屋」：実際に使える消耗品を販売
            "BASIC_ITEM_SHOP": [
                { id: "POTION", itemId: "POTION", name: "やくそう", description: "HPを30回復する、旅の必需品。", price: 50 },
                { id: "HIGH_POTION", itemId: "HIGH_POTION", name: "じょうやくそう", description: "HPを120回復する、激戦に備えた一品。", price: 200 },
                { id: "BOMB", itemId: "BOMB", name: "ばくだん", description: "敵1体に50の固定ダメージを与える。", price: 40 },
                { id: "ingr_01", name: "ゴーゴーダケ", description: "崖登りのスピードが上がる。料理に最適。", price: 12 },
                { id: "ingr_02", name: "マックスラディッシュ", description: "料理に使うと、限界を超えてHPを回復する。", price: 32 },
                { id: "tool_01", name: "削岩棒", description: "岩を砕くのに適した、無骨なハンマー。", price: 150 },
                { id: "food_01", name: "焼きキノコ", description: "直火で炙った香ばしいキノコ。", price: 15 },
            ],

            // 武器・防具屋:購入すると装備在庫に入り、そうび画面で装備できる
            "WEAPON_SHOP": [
                { id: EquipmentId.RUSTY_SWORD, itemId: EquipmentId.RUSTY_SWORD, name: "さびた剣", description: "こうげき+3。勇者・戦士むけ。", price: 120 },
                { id: EquipmentId.IRON_SWORD, itemId: EquipmentId.IRON_SWORD, name: "鉄の剣", description: "こうげき+8。勇者・戦士むけ。", price: 480 },
                { id: EquipmentId.OAK_STAFF, itemId: EquipmentId.OAK_STAFF, name: "樫の杖", description: "まりょく+4。魔法使い・僧侶むけ。", price: 200 },
                { id: EquipmentId.IRON_SHIELD, itemId: EquipmentId.IRON_SHIELD, name: "鉄の盾", description: "ぼうぎょ+5 すばやさ-1。", price: 320 },
                { id: EquipmentId.LEATHER_ARMOR, itemId: EquipmentId.LEATHER_ARMOR, name: "革の鎧", description: "ぼうぎょ+4。全職そうび可。", price: 200 },
                { id: EquipmentId.POWER_RING, itemId: EquipmentId.POWER_RING, name: "力の指輪", description: "こうげき+2 まりょく+2。全職そうび可。", price: 500 },
            ],

            // 「ゾナウ素材屋」：バッテリーやスクラビルド用のパーツ
            "ZONAI_RESOURCE_SHOP": [
                { id: "z_01", name: "ゾナウエネルギー", description: "ゾナウギアの動力源。", price: 20 },
                { id: "z_02", name: "大きなゾナウエネルギー", description: "一定時間、バッテリーの消費を肩代わりする。", price: 100 },
                { id: "z_part_01", name: "火龍の頭", description: "火を噴き出すゾナウギア。", price: 45 },
                { id: "z_part_02", name: "扇風機", description: "風を発生させる。乗り物の動力に最適。", price: 45 },
                { id: "z_part_03", name: "追尾台車", description: "敵を自動で追いかける。", price: 80 },
                { id: "z_cryst_01", name: "ゾナニウムの結晶", description: "バッテリーを拡張するための結晶。", price: 500 },
            ],

            // 「伝説の武器屋」：高額で強力なレア装備
            "LEGENDARY_WEAPON_SHOP": [
                { id: "leg_01", name: "鉄の剣", description: "手入れの行き届いた剣。", price: 2000 },
                { id: "leg_02", name: "鋼の剣", description: "鋭い切れ味を持つ名剣。", price: 4500 },
                { id: "leg_03", name: "銀の騎士剣", description: "美しい装飾の剣。", price: 25000 },
                { id: "leg_04", name: "王家の剣", description: "圧倒的な耐久度を誇る剣。", price: 75000 },
                { id: "leg_05", name: "黄昏の弓", description: "光り輝く矢を放つとされる弓。", price: 120000 },
                { id: "leg_06", name: "マスターレプリカ", description: "見た目だけは本物。", price: 500000 },
                { id: "leg_07", name: "黄金の巨岩砕き", description: "伝説の重火器。", price: 1500000 },
            ],
        };

        return mockMaster[shopId] || [];
    }
}
