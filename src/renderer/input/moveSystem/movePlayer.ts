// src/renderer/input/moveSystem/movePlayer.ts

import { MOVE_SPEED } from "../../../shared/data/playerConstants";
import { AppDirection } from "../../../shared/type/PlayerState";
import { InputAxis } from "../mapping/InputMapper";

export function movePlayer(axes: InputAxis[], delta: number, speedModifier: number = 1) {
    const speed = MOVE_SPEED * speedModifier * (delta / 1000);
    let moveX = 0;
    let moveY = 0;
    let direction: AppDirection = AppDirection.DOWN;

    if (axes.includes("UP")) {
        moveY -= speed;
        direction = AppDirection.UP;
    }
    if (axes.includes("DOWN")) {
        moveY += speed;
        direction = AppDirection.DOWN;
    }
    if (axes.includes("LEFT")) {
        moveX -= speed;
        direction = AppDirection.LEFT;
    }
    if (axes.includes("RIGHT")) {
        moveX += speed;
        direction = AppDirection.RIGHT;
    }

    return { moveX, moveY, direction };
}
