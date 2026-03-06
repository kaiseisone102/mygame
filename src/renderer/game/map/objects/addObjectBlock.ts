// src/game/map/objects/addObjectBlock.ts
import { objectDatabase } from "./objectDatabase";
import type { ObjectLayer } from "./objectLayer";
import { ObjectType } from "./objectType";
/**
 * @param addObjectBlock オブジェクトを複数並べる
 * @param layer     ObjectLayer 配置先
 * @param type      ↓ObjectType一覧↓
 * @see ObjectType  にCtr + カーソルホバー
 * @param startX    左上開始X（タイル単位）
 * @param startY    左上開始Y（タイル単位）
 * @param w         横に並べる個数
 * @param h         縦に並べる個数
 */
export function addObjectBlock(
  layer: ObjectLayer,
  type: ObjectType,
  startX: number,
  startY: number,
  w: number,
  h: number
) {
  const size = objectDatabase[type].width!;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      layer.add({
        ...objectDatabase[type],
        type,
        tx: startX + x * size,
        ty: startY + y * size,
      });
    }
  }
}
/**
 * @param addObject オブジェクトを一つ置く
 * @param layer     ObjectLayer 配置先
 * @param type      ↓ObjectType一覧↓
 * @see ObjectType  にCtr + カーソルホバー
 * @param x         左上開始X（タイル単位）
 * @param y         左上開始Y（タイル単位）
 */
export function addObject(
  layer: ObjectLayer,
  type: ObjectType,
  tx: number,
  ty: number
) {
  layer.add({
    ...objectDatabase[type],
    type,
    tx,
    ty,
  });
}