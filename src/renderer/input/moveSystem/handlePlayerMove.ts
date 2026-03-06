// src/renderer/system/moveSystem/handlePlayerMove.ts

import { TileEffectService } from "../../../renderer/service/tile/TileEffectService ";
import { isHitObject } from "../../../renderer/game/map/objects/isHitObject";
import { ObjectLayer } from "../../../renderer/game/map/objects/objectLayer";
import { SignData } from "../../../renderer/game/map/talkNPC/SignData";
import { World } from "../../../shared/core/world";
import { P_HIT_SIZE, NORM_SIZE } from "../../../shared/data/constants";
import { AppDirection } from "../../../shared/type/PlayerState";
import { TileType } from "../../../shared/type/tileType";
import { ZonePx } from "../../../shared/type/ZonePx";
import { InputAxis } from "../mapping/InputMapper";
import { movePlayer } from "./movePlayer";
import { WorldPxPosition } from "../../../shared/type/playerPosition/posType";
import { NpcData } from "../../../renderer/game/map/talkNPC/NPCData";

export interface PlayerMoveResult {
    moved: boolean;
    pos: WorldPxPosition;
    direction: AppDirection;
    damage: number;

    blockedTile?: TileType;
    hitObject?: boolean;
    hitboxPoints: WorldPxPosition[]; // 四隅

    onDamageTile: boolean;   // ★ 今ダメージ床の上？
    damageApplied: boolean;  // ★ 今フレームでダメージ発生したか

    footTile: TileType;
    speedModifier: number;
}

export function handlePlayerMove(
    axes: InputAxis[],
    pos: WorldPxPosition,
    moveSystem: { moved: boolean },
    world: World,
    objectLayer: ObjectLayer,
    zones: ZonePx[],
    npcs: NpcData[],
    signs: SignData[],
    delta: number,
    tileEffect: TileEffectService,
    context: any
): PlayerMoveResult {
    const prevX = pos.x;
    const prevY = pos.y;
    const footTile = getFootTile(world, pos);
    const walkResult = tileEffect.resolve(footTile, context);
    const footDamage = walkResult.damage;
    const damage = walkResult.damage ?? 0;

    const speedModifier =
        walkResult.canWalk
            ? (walkResult.speedModifier ?? 1)
            : 1;

    const { moveX, moveY, direction } = movePlayer(axes, delta, speedModifier);

    const moved = moveX !== 0 || moveY !== 0;
    moveSystem.moved = moved;

    if (!moved) {
        const points = getHitboxPoints(pos);
        return {
            moved: false,
            pos: { x: prevX, y: prevY },
            direction,
            hitboxPoints: points,
            damage,
            onDamageTile: damage > 0,   // 必須
            damageApplied: false,       // このフレームではダメージ発生なし
            footTile,
            speedModifier
        };
    }

    let blockedTile: TileType | undefined;
    let hitObject: boolean = false;

    // --- X方向 ---
    pos.x += moveX;
    blockedTile = getBlockedTile(world, pos, tileEffect, context);
    hitObject = isHitObject(pos, objectLayer);
    const blockedByZoneX = isBlockedByZoneOrSign(pos, zones, npcs, signs)
    if (blockedTile || hitObject || blockedByZoneX) {
        pos.x = prevX;
    }

    // --- Y方向 ---
    pos.y += moveY;

    const blockedTileY = getBlockedTile(world, pos, tileEffect, context);
    const hitObjectY = isHitObject(pos, objectLayer);
    const blockedByZoneY = isBlockedByZoneOrSign(pos, zones, npcs, signs);
    if (blockedTileY || hitObjectY || blockedByZoneY) {
        pos.y = prevY;
        blockedTile = blockedTile ?? blockedTileY;
        hitObject = hitObject || hitObjectY;
    }

    const hitboxPoints = getHitboxPoints(pos);

    return {
        moved: true,
        pos,
        direction,
        blockedTile,
        hitObject,
        hitboxPoints,
        damage,
        onDamageTile: damage > 0,           // 今この瞬間、ダメージ床か？
        damageApplied: damage > 0 && moved, // このフレームでダメージ判定が発生したか
        footTile,
        speedModifier
    };
}

// プレイヤー四隅ヒットボックス計算
export function getHitboxPoints(pos: WorldPxPosition) {
    const left = pos.x - P_HIT_SIZE / 2;
    const top = pos.y - P_HIT_SIZE / 2;
    return [
        { x: left, y: top },                            // 左上
        { x: left + P_HIT_SIZE, y: top },               // 右上
        { x: left, y: top + P_HIT_SIZE },               // 左下
        { x: left + P_HIT_SIZE, y: top + P_HIT_SIZE },  // 右下
    ];
}

function getBlockedTile(
    world: World,
    pos: WorldPxPosition,
    tileEffect: TileEffectService,
    context: any
): TileType | undefined {
    const points = getHitboxPoints(pos);

    for (const p of points) {
        // ここように ピクセル座標 -> タイル座標
        const tx = Math.floor(p.x / NORM_SIZE);
        const ty = Math.floor(p.y / NORM_SIZE);

        // ワールド外も通行不可扱い
        if (tx < 0 || ty < 0 || tx >= world.width || ty >= world.height) {
            return TileType.SKY; // 仮に空扱い
        }
        const tile = world.getTile({ tx, ty });
        const result = tileEffect.resolve(tile, context)
        if (!result.canWalk) return tile; // 通行不可のタイルを返す
    }

    return undefined; // 当たっていない場合
}

function isBlockedByZoneOrSign(
    pos: WorldPxPosition,
    zones: ZonePx[],
    npcs: NpcData[],
    signs: SignData[]
): boolean {
    // Zone 判定
    for (const zone of zones) {
        if (!zone.block) continue;

        if (
            pos.x + P_HIT_SIZE / 2 > zone.pos.x &&
            pos.x - P_HIT_SIZE / 2 < zone.pos.x + zone.w &&
            pos.y + P_HIT_SIZE / 2 > zone.pos.y &&
            pos.y - P_HIT_SIZE / 2 < zone.pos.y + zone.h
        ) return true;
    }
    // Npc 判定
    if (npcs) {
        for (const npc of npcs) {
            const w = (npc.w ?? NORM_SIZE);
            const h = (npc.h ?? NORM_SIZE);
            const nx = npc.pos.x;
            const ny = npc.pos.y;

            if (
                pos.x + P_HIT_SIZE / 2 > nx &&
                pos.x - P_HIT_SIZE / 2 < nx + w &&
                pos.y + P_HIT_SIZE / 2 > ny &&
                pos.y - P_HIT_SIZE / 2 < ny + h
            ) return true;
        }
    }
    // Sign 判定
    if (signs) {
        for (const sign of signs) {
            const w = (sign.w ?? NORM_SIZE);
            const h = (sign.h ?? NORM_SIZE);
            const sx = sign.pos.x;
            const sy = sign.pos.y;

            if (
                pos.x + P_HIT_SIZE / 2 > sx &&
                pos.x - P_HIT_SIZE / 2 < sx + w &&
                pos.y + P_HIT_SIZE / 2 > sy &&
                pos.y - P_HIT_SIZE / 2 < sy + h
            ) return true;
        }
    }
    return false;
}

function getFootTile(world: World, pos: WorldPxPosition): TileType {
    const tx = Math.floor(pos.x / NORM_SIZE);
    const ty = Math.floor(pos.y / NORM_SIZE);
    return world.getTile({ tx, ty });
}
