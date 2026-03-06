// src/renderer/save/query/ScreenQueryService.ts

import { TileQueryPort } from "../../../shared/port/TileQueryPort";
import { TileType } from "../../../shared/type/tileType";

export interface ScreenStateReader {
    getActiveOverlayType(): string | null;
}
/**
 * ScreenQueryService
 * ------------------
 * 現在の画面状態を「参照のみ」行う
 */
export class ScreenQueryService {
    constructor(
        private reader: ScreenStateReader,
        private tileQuery: TileQueryPort
    ) { }

    getActiveOverlayType(): string | null {
        return this.reader.getActiveOverlayType();
    }

    getTileType(tx: number, ty: number): TileType {
        return this.tileQuery.getTileType(tx, ty);
    }
}
