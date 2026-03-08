// src/shared/core/world.ts

import { CHUNK_TILES } from "../data/constants";
import { TileQueryPort } from "../port/TileQueryPort";
import { BiomeId, TileBiomeMap } from "../type/battle/enemy/BiomeId";
import { WorldTilePosition } from "../type/playerPosition/posType";
import { TileType } from "../type/tileType";
import { Chunk } from "./chunk";

/**
 * World
 *
 * 役割:
 * - タイル単位のワールド管理
 * - Chunk分割による遅延生成
 * - TileQueryPort の実装
 *
 * 特徴:
 * - 全タイルを2次元配列で持たない
 * - 必要になったChunkだけ生成する（疎なワールド向き）
 */
export class World implements TileQueryPort {

    /** ワールドの横幅（タイル単位） */
    width: number;

    /** ワールドの高さ（タイル単位） */
    height: number;

    /** 横方向のChunk数 */
    chunkWidth: number;

    /** 縦方向のChunk数 */
    chunkHeight: number;

    /** Chunkが未生成のときに使うデフォルトタイル */
    defaultTile: TileType;

    /**
     * 実体データ
     * key: "cx,cy"
     * value: Chunk
     */
    chunks: Map<string, Chunk> = new Map();

    constructor(
        width: number,
        height: number,
        defaultTile: TileType
    ) {
        this.width = width;
        this.height = height;
        this.defaultTile = defaultTile;

        // ワールド全体をチャンク単位で分割した数
        this.chunkWidth = Math.ceil(width / CHUNK_TILES);
        this.chunkHeight = Math.ceil(height / CHUNK_TILES);
    }

    /**
     * Chunkのキー生成
     * 例: (2,3) -> "2,3"
     */
    private key(cx: number, cy: number) {
        return `${cx},${cy}`;
    }

    /**
     * TileQueryPort 実装
     * 外部からは getTileType 経由で取得させる
     */
    getTileType(pos: WorldTilePosition): TileType {
        return this.getTile(pos);
    }

    getBiomeFromTile(tile: TileType): BiomeId {
        return TileBiomeMap[tile];
    }

    /**
     * 既存Chunk取得（無ければ null）
     */
    getChunk(cx: number, cy: number): Chunk | null {
        return this.chunks.get(this.key(cx, cy)) ?? null;
    }

    /**
     * Chunkが存在しなければ生成する
     * 遅延生成（Lazy Creation）
     */
    ensureChunk(cx: number, cy: number): Chunk {
        const key = this.key(cx, cy);
        if (!this.chunks.has(key)) {
            this.chunks.set(key, new Chunk(this.defaultTile));
        }
        return this.chunks.get(key)!;
    }

    /**
     * タイルを書き込む（ピクセルではなくタイル単位の座標を想定）
     *
     * 処理の流れ:
     * 1. ワールド座標 → Chunk座標へ変換
     * 2. Chunk内部のローカル座標へ変換
     * 3. Chunkへ書き込み
     */
    setTile(pos: WorldTilePosition, tile: TileType) {
        const cx = Math.floor(pos.tx / CHUNK_TILES);
        const cy = Math.floor(pos.ty / CHUNK_TILES);

        const tx = pos.tx % CHUNK_TILES;
        const ty = pos.ty % CHUNK_TILES;

        const chunk = this.ensureChunk(cx, cy);
        chunk.set(tx, ty, tile);
    }

    /**
     * タイル取得
     *
     * 処理の流れ:
     * 1. タイル座標 → Chunk座標へ変換
     * 2. Chunk内部座標へ変換
     * 3. Chunkが存在すれば取得
     * 4. 無ければ defaultTile を返す
     */
    getTile(pos: WorldTilePosition): TileType {
        const cx = Math.floor(pos.tx / CHUNK_TILES);
        const cy = Math.floor(pos.ty / CHUNK_TILES);

        const chunkTileX = pos.tx % CHUNK_TILES;
        const chunkTileY = pos.ty % CHUNK_TILES;

        const chunk = this.getChunk(cx, cy);
        return chunk ? chunk.get(chunkTileX, chunkTileY) : this.defaultTile;
    }

    getWorldSize(): { width: number, height: number } {
        return { width: this.width, height: this.height }
    }
}
