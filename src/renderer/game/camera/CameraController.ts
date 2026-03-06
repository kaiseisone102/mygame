// src/renderer/game/camera/CameraController.ts

import { Camera } from "../../../shared/core/camera";
import { WorldPxPosition } from "../../../shared/type/playerPosition/posType";

export class CameraController {
    constructor(private camera: Camera) { }

    followPlayer(pos: WorldPxPosition) {
        this.camera.follow(pos.x, pos.y);
    }

    getCamera() {
        return this.camera;
    }
}
