// src/renderer/game/player/PlayerController.ts

import { TileEffectService } from "../../service/tile/TileEffectService ";
import { eventBus } from "../../../renderer/app";
import { InputAxis } from "../../../renderer/input/mapping/InputMapper";
import { PlayerMoveResult, handlePlayerMove } from "../../../renderer/input/moveSystem/handlePlayerMove";
import { ZoneBehaviors } from "../../../renderer/router/ZoneBehaviors";
import { P_HIT_SIZE } from "../../../shared/data/constants";
import { GameState } from "../../../shared/data/gameState";
import { DEFAULT_PLAYER_HP } from "../../../shared/data/playerConstants";
import { MapId } from "../../../shared/type/MapId";
import { moveSystem } from "../../../shared/type/moveSystem";
import { AppDirection, PlayerMotionType, PlayerState } from "../../../shared/type/PlayerState";
import { ZonePx } from "../../../shared/type/ZonePx";
import { ObjectLayer } from "../map/objects/objectLayer";
import { FieldItem, ItemData } from "../map/talkNPC/ItemData";
import { SignData } from "../map/talkNPC/SignData";
import { WorldPxPosition } from "../../../shared/type/playerPosition/posType";
import { pxPosToTilePos } from "../map/tileToPixel";
import { RectPx } from "../map/objects/rect";
import { NpcData } from "../map/talkNPC/NPCData";
import { TileType } from "../../../shared/type/tileType";
import { TileQueryPort } from "../../../shared/port/TileQueryPort";

export type PlayerUpdateResult = {
    state: PlayerState;
    moveResult: PlayerMoveResult;
};

// 移動中、止まっている、方向 を PlayerController が管理
export class PlayerController {
    private state: PlayerState = { type: PlayerMotionType.IDLE, direction: AppDirection.DOWN };

    // エンカ用 (タイルごとにエンカウント判定)
    private lastTileX: number = 0;
    private lastTileY: number = 0;

    private lastFootTile?: TileType;

    private zones: ZonePx[] = []; // マップの Zone を保持
    private npcs: NpcData[] = [];
    private sign: SignData[] = [];
    private item: ItemData[] = [];

    constructor(
        private world: TileQueryPort,
        private objectLayer: ObjectLayer,
        private tileEffect: TileEffectService,
        private walkContext: any,
        private gameState: GameState,
        private mapId: MapId,
    ) { }

    update(pos: WorldPxPosition, axes: InputAxis[], delta: number): PlayerUpdateResult {
        // 入力なしは待機状態
        if (!axes.length) {
            this.state.type = PlayerMotionType.IDLE;
            const emptyMoveResult: PlayerMoveResult = {
                moved: false,
                pos,
                direction: this.state.direction,
                damage: 0,
                onDamageTile: false,
                damageApplied: false,
                hitboxPoints: [],
                footTile: this.lastFootTile ?? TileType.DARK,
                speedModifier: 1
            };
            return { state: this.state, moveResult: emptyMoveResult, };
        }

        const moveResult = handlePlayerMove(
            axes,
            pos,
            moveSystem,
            this.world,
            this.objectLayer,
            this.zones,
            this.npcs,
            this.sign,
            delta,
            this.tileEffect,
            this.walkContext
        );

        // 衝突情報
        if (moveResult.blockedTile || moveResult.hitObject) console.log("衝突タイル:", moveResult.blockedTile, "オブジェクト？", moveResult.hitObject)

        if (moveResult.footTile !== this.lastFootTile) {
            console.log("[FootTile Changed]", this.lastFootTile ?? "", "→", moveResult.footTile, "| speed:", moveResult.speedModifier, moveResult.damage > 0 ? "damage" : "normal");

            this.lastFootTile = moveResult.footTile;
        }

        // ===== ランダムエンカウント判定 =====
        if (moveResult.moved) {

            const tilePos = pxPosToTilePos(pos)
            if (!tilePos) throw new Error("tilePos missing in PlayerController");
            if (tilePos.tx !== this.lastTileX || tilePos.ty !== this.lastTileY) {

                this.lastTileX = tilePos.tx;
                this.lastTileY = tilePos.ty;

                this.gameState.battleReturn = { mapId: this.mapId, pos: structuredClone(pos) };

                const tileType = this.world.getTileType(tilePos);
                const biome = this.world.getBiomeFromTile(tileType);

                if (!tileType) throw new Error("tileType missing in PlayerController");
                if (!biome) throw new Error("biome missing in PlayerController");

                eventBus.emit("REQUEST_RANDOM_ENCOUNTER", {
                    mapId: this.mapId,
                    pos: structuredClone(pos),
                    biomeId: biome
                });
            }
        }

        // プレイヤーのヒットボックス
        const playerRect = {
            pos: { x: moveResult.hitboxPoints[0].x, y: moveResult.hitboxPoints[0].y }, // 左上
            w: P_HIT_SIZE,
            h: P_HIT_SIZE,
        };

        // --- Zone判定 ---
        for (const zone of this.zones) {
            const zoneRect = { pos: { x: zone.pos.x, y: zone.pos.y }, w: zone.w, h: zone.h };

            const isInside = this.rectIntersect(playerRect, zoneRect);

            // zone侵入判定
            const entered = isInside && !zone.isPlayerInside;
            const left = !isInside && zone.isPlayerInside;

            // zone接触処理
            const behavior = ZoneBehaviors[zone.type];
            if (!behavior) continue;

            if (entered) {
                const tilePos = pxPosToTilePos(pos);

                zone.isPlayerInside = true;
                behavior?.onEnter?.(zone, {
                    pos,
                    player: this.state,
                    gameState: this.gameState,
                    mapId: this.mapId,
                    biomeId: this.world.getBiomeFromTile(this.world.getTileType(tilePos))
                });
            }

            if (left) {
                const tilePos = pxPosToTilePos(pos);

                zone.isPlayerInside = false;
                behavior?.onLeave?.(zone, {
                    pos,
                    player: this.state,
                    gameState: this.gameState,
                    mapId: this.mapId,
                    biomeId: this.world.getBiomeFromTile(this.world.getTileType(tilePos))
                });
            }

            if (isInside) {
                const tilePos = pxPosToTilePos(pos);

                behavior?.update?.(zone, {
                    pos,
                    player: this.state,
                    gameState: this.gameState,
                    mapId: this.mapId,
                    biomeId: this.world.getBiomeFromTile(this.world.getTileType(tilePos))
                }, delta);
            }
        }

        // プレイヤー状態更新
        if (moveResult.direction) {
            this.state.type = moveResult.moved ? PlayerMotionType.WALK : PlayerMotionType.IDLE;
            this.state.direction = moveResult.direction;
        }

        this.gameState.where[this.mapId] = structuredClone(pos);

        return {
            state: this.state,
            moveResult,
        };
    }

    getState(): PlayerState {
        return this.state;
    }

    // 矩形同士の当たり判定
    rectIntersect(a: RectPx, b: RectPx) {
        return a.pos.x < b.pos.x + b.w &&
            a.pos.x + a.w > b.pos.x &&
            a.pos.y < b.pos.y + b.h &&
            a.pos.y + a.h > b.pos.y;
    }

    setWorld(world: TileQueryPort, objectLayer: ObjectLayer) {
        this.world = world;
        this.objectLayer = objectLayer;
    }

    setZones(zones: ZonePx[]) {
        this.zones = zones.map(z => ({ ...z, isPlayerInside: false })); // 内部フラグ初期化
    }

    setNpcs(npcs: NpcData[]) {
        this.npcs = npcs;
    }

    setSigns(signs: SignData[]) {
        this.sign = signs;
    }

    setItems(items: ItemData[]) {
        this.item = items;
    }

    collectItem(item: ItemData) {
        if (this.gameState.collectedItems[item.id]) return;

        this.gameState.collectedItems[item.id] = true;

        // 効果
        switch (item.type) {
            case FieldItem.POTION:
                this.gameState.hp = Math.min(this.gameState.hp + 20, DEFAULT_PLAYER_HP);
                break;
            case FieldItem.GOLD:
                this.gameState.gold += 100;
                break;
        }

        item.onCollect?.();
    }

}

