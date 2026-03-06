// src/shared/core/camera.ts

export class Camera {
    x = 0;
    y = 0;

    constructor(
        public width: number,
        public height: number,
        public worldWidth: number,
        public worldHeight: number
    ) {}

    follow(px: number, py: number) {
        this.x = px - this.width / 2;
        this.y = py - this.height / 2;
    }
}
