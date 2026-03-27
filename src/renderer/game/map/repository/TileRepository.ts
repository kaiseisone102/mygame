// src/renderer/game/map/tiles/TileRepository.ts

import tileDataRaw from "./tileDefinitions.json";
import { TileType } from "../../../../shared/type/tileType";
import { ImageStore } from "../../../../renderer/asset/ImageStore";
import { TileData } from "./createTileDatabase";

export class TileRepository {
    // 100件以上の高速検索に適した Map オブジェクト
    private static instance: Map<TileType, TileData> = new Map();
    private static isInitialized = false;

    constructor(tileDataRaw: )
    /**
     * ゲーム開始時、またはアセットロード完了後に一度だけ呼ぶ
     */
    public static initialize(): void {
        if (this.isInitialized) return;

        // JSONデータを元に、TileDataオブジェクトを組み立ててMapに格納
        Object.entries(tileDataRaw).forEach(([key, config]) => {
            const type = key as TileType;
            
            this.instance.set(type, {
                type: type,
                walkable: config.walkable ?? true,
                requires: config.requires,
                image: config.imageKey ? ImageStore.get(config.imageKey) : undefined,
                color: config.color,
                damage: config.damage,
                speedModifier: config.speedModifier ?? 1.0,
                encounterRateModifier: config.encounterRateModifier ?? 1.0
            } as TileData);
        });

        this.isInitialized = true;
        console.log(`TileRepository: ${this.instance.size} tiles loaded.`);
    }

    /**
     * 指定したタイルのデータを取得（O(1) の高速アクセス）
     */
    public static get(type: TileType): TileData {
        const data = this.instance.get(type);
        if (!data) {
            // 定義漏れがあった場合のフォールバック（デバッグ用）
            return this.instance.get(TileType.PLAIN)!;
        }
        return data;
    }

    /**
     * 条件に合うタイルをフィルタリング（例：ダメージ床だけ抽出など）
     */
    public static getAllTiles(): TileData[] {
        return Array.from(this.instance.values());
    }
}