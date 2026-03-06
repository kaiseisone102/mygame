// src/renderer/input/moveSystem/checkPlayerInteractions.ts

import { TownZone, Enemy, AreaZone } from "../../../renderer/game/map/MapData/interface/MapData";
import { P_HIT_SIZE } from "../../../shared/data/constants";

// プレイヤーのヒットボックス四隅で対象に触れたかチェック
export function checkPlayerInteractions(
    playerX: number,
    playerY: number,
    towns: TownZone[],
    enemies: Enemy[],
    zones: AreaZone[]
) {
    const left = playerX - P_HIT_SIZE / 2;
    const top = playerY - P_HIT_SIZE / 2;
    const right = left + P_HIT_SIZE;
    const bottom = top + P_HIT_SIZE;

    const points = [
        { x: left, y: top },       // 左上
        { x: right, y: top },      // 右上
        { x: left, y: bottom },    // 左下
        { x: right, y: bottom },   // 右下
    ];

    // 町に触れたか
    const touchedTown = towns.find(town =>
        points.some(p =>
            p.x >= town.tx && p.x <= town.tx + town.TWidth &&
            p.y >= town.ty && p.y <= town.ty + town.THeight
        )
    );

    // 敵に触れたか
    const touchedEnemy = enemies.find(enemy =>
        points.some(p =>
            p.x >= enemy.tx && p.x <= enemy.tx + enemy.TWidth &&
            p.y >= enemy.ty && p.y <= enemy.ty + enemy.THeight
        )
    );

    // 移動可能ゾーンに触れたか
    const touchedZone = zones.find(zone =>
        points.some(p =>
            p.x >= zone.tx && p.x <= zone.tx + zone.TWidth &&
            p.y >= zone.ty && p.y <= zone.ty + zone.THeight
        )
    );

    return {
        town: touchedTown ?? null,
        enemy: touchedEnemy ?? null,
        zone: touchedZone ?? null
    };
}
