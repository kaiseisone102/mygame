// src/renderer/game/map/objects/objectLayerRenderer.ts

import { ImageStore } from "../../../../renderer/asset/ImageStore";
import { Camera } from "../../../../shared/core/camera";
import { NORM_SIZE } from "../../../../shared/data/constants";
import { objectDatabase } from "./objectDatabase";
import { ObjectLayer } from "./objectLayer";

export class ObjectLayerRenderer {
    constructor(private ctx: CanvasRenderingContext2D) {}

    render(objectLayer: ObjectLayer, camera: Camera) {
        for (const obj of objectLayer.objects) {
            const data = objectDatabase[obj.type];
            const img = ImageStore.get(data.imageKey);

            if (!img) {
                console.error("Image not loaded:", data.imageKey);
                continue;
            }

            const screenX = obj.tx * NORM_SIZE - camera.x;
            const screenY = obj.ty * NORM_SIZE - camera.y;
            const w = data.width! * NORM_SIZE;
            const h = data.height! * NORM_SIZE;

            if (
                ImageStore.get(data.imageKey) &&
                ImageStore.get(data.imageKey).complete &&
                ImageStore.get(data.imageKey).naturalWidth > 0
            ) {
                this.ctx.drawImage(ImageStore.get(data.imageKey), screenX, screenY, w, h);
            }
        }
    }
}
