// src/renderer/game/world/WorldRenderer.ts
import { WorldPxPosition } from "../../../shared/type/playerPosition/posType";
import { ImageStore } from "../../../renderer/asset/ImageStore";
import { ObjectLayer } from "../../../renderer/game/map/objects/objectLayer";
import { ObjectLayerRenderer } from "../../../renderer/game/map/objects/objectLayerRenderer";
import { TileRenderer } from "../../../renderer/game/map/tiles/tileRenderer";
import {
    debugDrawHitboxes, debugDrawItems, debugDrawNpcsHitBox, debugDrawPlayerHitbox, debugDrawPlayerTalkRect,
    debugDrawSignHitboxes, debugDrawZonesHitBox
} from "../../../renderer/module/debug/debugDrawPlayerHitbox";
import type { Camera } from "../../../shared/core/camera";
import type { World } from "../../../shared/core/world";
import { NORM_SIZE } from "../../../shared/data/constants";
import { PlayerState } from "../../../shared/type/PlayerState";
import { ItemData } from "../map/talkNPC/ItemData";
import { NpcData } from "../map/talkNPC/NPCData";
import { SignData } from "../map/talkNPC/SignData";
import { ZonePx } from "../../../shared/type/ZonePx";

export class WorldRenderer {
    private objectLayerRenderer: ObjectLayerRenderer;
    private damageFlash = false;
    constructor(
        private ctx: CanvasRenderingContext2D,
        private tileRenderer: TileRenderer,
        private debug: boolean = false
    ) {
        this.objectLayerRenderer = new ObjectLayerRenderer(ctx);
    }

    render(
        world: World,
        objectLayer: ObjectLayer,
        camera: Camera,
        playerPos: WorldPxPosition,
        playerState: PlayerState,
        zones?: ZonePx[],
        npcs?: NpcData[],
        signs?: SignData[],
        items?: ItemData[]
    ) {
        // タイル描画
        this.tileRenderer.render(world, camera, this.ctx);

        // オブジェクト描画
        this.objectLayerRenderer.render(objectLayer, camera);

        if (this.debug) {
            debugDrawPlayerHitbox(this.ctx, playerPos, camera);
            debugDrawHitboxes(this.ctx, playerPos, objectLayer, camera);
            debugDrawPlayerTalkRect(this.ctx, playerPos, playerState, camera);
            if (zones) {
                debugDrawZonesHitBox(this.ctx, zones, camera);
            }
            if (npcs) {
                debugDrawNpcsHitBox(this.ctx, npcs, camera);
            }
            if (signs) {
                debugDrawSignHitboxes(this.ctx, signs, camera);
            }
            if (items) {
                debugDrawItems(this.ctx, items, camera);
            }
        }
        // --- ダメージフラッシュ ---
        if (this.damageFlash) {
            this.ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
    }

    drawPlayer(
        image: HTMLImageElement,    // プレイヤーの描画に使う画像（スプライト）
        pos: WorldPxPosition,     // プレイヤーのワールドPx座標 
        camera: Camera              // カメラ情報（viewportの位置やサイズ）
    ) {
        this.ctx.drawImage(
            image,
            pos.x - camera.x - NORM_SIZE / 2,       // 画面上での X 座標 = ワールド X - カメラ左端 + オフセット（16pxはスプライトの中央補正）
            pos.y - camera.y - NORM_SIZE + NORM_SIZE / 4,  // 画面上での Y 座標 = ワールド Y - カメラ上端 - オフセット（24pxはスプライト足元基準の調整）
            NORM_SIZE,                 // 描画幅（px）
            NORM_SIZE * 1.5                  // 描画高さ（px）
        );
    }

    drawZones(zones: ZonePx[], camera: Camera) {
        for (const zone of zones) {
            const x = zone.pos.x - camera.x;
            const y = zone.pos.y - camera.y;

            if (zone.image) {
                const img = ImageStore.get(zone.image);
                this.ctx.drawImage(img, x, y, zone.w, zone.h);
            }
        }
    }

    drawNpcs(npcs: NpcData[], camera: Camera) {
        for (const npc of npcs) {
            if (!npc.image) continue;
            const img = ImageStore.get(npc.image);

            const worldX = npc.pos.x;
            const worldY = npc.pos.y;

            this.ctx.drawImage(
                img,
                worldX - camera.x,
                worldY - camera.y - NORM_SIZE / 4,
                npc.w,
                npc.h * 1.5
            );
        }
    }

    drawSigns(signs: SignData[], camera: Camera) {
        for (const sign of signs) {
            if (!sign.image) continue;
            const img = ImageStore.get(sign.image);

            const worldX = sign.pos.x;
            const worldY = sign.pos.y;

            this.ctx.drawImage(
                img,
                worldX - camera.x,
                worldY - camera.y - NORM_SIZE / 4,
                sign.w,
                sign.h * 1.5
            )
        }
    }

    drawItems(items: ItemData[], camera: Camera) {
        for (const item of items) {
            if (!item.image) continue;
            const img = ImageStore.get(item.image);

            const worldX = item.pos.x;
            const worldY = item.pos.y;

            this.ctx.drawImage(
                img,
                worldX - camera.x,
                worldY - camera.y,
                item.w,
                item.h
            );
        }
    }

    startDamageFlash() {
        this.damageFlash = true;
    }

    stopDamageFlash() {
        this.damageFlash = false;
    }
}
