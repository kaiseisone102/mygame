// src/renderer/game/map/interaction/application/InteractionService.ts

import { OverlayScreenType } from "../../../../../shared/type/screenType";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { InteractionTarget } from "../InteractionTarget";
import { MessageRepository } from "./message/MessageRepository";
import { ShopItem } from "../../../../../renderer/screens/overlayScreen/screen/ShopOverlay";

export class InteractionService {

    constructor(private messageRepo: MessageRepository) { }

    createTalkEvent(messageId: string): AppUIEvent {
        const message = this.messageRepo.getMessage(messageId) ?? "...";
        return {
            type: "PUSH_OVERLAY",
            overlay: OverlayScreenType.MESSAGE_LOG,
            payload: { messages: [message] }
        };
    }

    createShopEvent(shopId: string): AppUIEvent {

        // 1. shopId からアイテムマスター（またはAPI）を使ってアイテムリストを取得
        const items = this.getMasterItemsByShopId(shopId);

        return {
            type: "PUSH_OVERLAY",
            overlay: OverlayScreenType.SHOP, // 追加が必要
            payload: { shopItems: items }
        };
    }

    private getMasterItemsByShopId(shopId: string): ShopItem[] {
        // 本来は外部の JSON やデータベースから取得する処理
        // テスト用のダミーデータ
        const mockMaster: Record<string, ShopItem[]> = {
            // 一般的な「よろず屋」：消耗品や基本的な素材
            "BASIC_ITEM_SHOP": [
                { id: "cons_01", name: "ポーション", description: "HPを20回復する、旅の必需品。", price: "50" },
                { id: "cons_02", name: "ハイポーション", description: "HPを100回復する、激戦に備えた一品。", price: "200" },
                { id: "ingr_01", name: "ゴーゴーダケ", description: "崖登りのスピードが上がる。料理に最適。", price: "12" },
                { id: "ingr_02", name: "マックスラディッシュ", description: "料理に使うと、限界を超えてHPを回復する。", price: "32" },
                { id: "arrow_01", name: "木の矢 x5", description: "標準的な矢。いくつあっても困らない。", price: "20" },
                { id: "arrow_02", name: "爆弾花", description: "着弾すると爆発する。取り扱い注意。", price: "40" },
                { id: "tool_01", name: "削岩棒", description: "岩を砕くのに適した、無骨なハンマー。", price: "150" },
                { id: "food_01", name: "焼きキノコ", description: "直火で炙った香ばしいキノコ。", price: "15" },
            ],

            "WEAPON_SHOP": [
                { id: "w1", name: "鉄の剣", description: "標準的な剣", price: `500` },
            ],

            // 「ゾナウ素材屋」：バッテリーやスクラビルド用のパーツ
            "ZONAI_RESOURCE_SHOP": [
                { id: "z_01", name: "ゾナウエネルギー", description: "ゾナウギアの動力源。そのまま使うと少し回復する。", price: "20" },
                { id: "z_02", name: "大きなゾナウエネルギー", description: "一定時間、バッテリーの消費を完全に肩代わりする。", price: "100" },
                { id: "z_part_01", name: "火龍の頭", description: "火を噴き出すゾナウギア。スクラビルドにも有効。", price: "45" },
                { id: "z_part_02", name: "扇風機", description: "風を発生させる。乗り物の動力に最適。", price: "45" },
                { id: "z_part_03", name: "追尾台車", description: "敵を自動で追いかける。兵器作成の要。", price: "80" },
                { id: "z_cryst_01", name: "ゾナニウムの結晶", description: "バッテリーを拡張するために必要な不思議な結晶。", price: "500" },
            ],

            // 「伝説の武器屋」：高額で強力なレア装備
            "LEGENDARY_WEAPON_SHOP": [
                { id: "leg_01", name: "鉄の剣", description: "兵士たちが愛用する、手入れの行き届いた剣。", price: "2,000" },
                { id: "leg_02", name: "鋼の剣", description: "鋭い切れ味を持つ、熟練の職人が打ち出した名剣。", price: "4,500" },
                { id: "leg_03", name: "銀の騎士剣", description: "気高き騎士が携えたとされる、美しい装飾の剣。", price: "25,000" },
                { id: "leg_04", name: "王家の剣", description: "ハイラル王家から下賜された、圧倒的な耐久度を誇る剣。", price: "75,000" },
                { id: "leg_05", name: "黄昏の弓", description: "古の伝承に登場する、光り輝く矢を放つとされる弓。", price: "120,000" },
                { id: "leg_06", name: "マスターレプリカ", description: "伝説の剣を模して作られた。見た目だけは本物。", price: "500,000" },
                { id: "leg_07", name: "黄金の巨岩砕き", description: "一振りで地形をも変えると言われる伝説の重火器。", price: "1,500,000" },
            ],
        };

        return mockMaster[shopId] || [];
    }
}