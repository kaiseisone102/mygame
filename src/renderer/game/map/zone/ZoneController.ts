// src/renderer/game/map/zone/ZoneController.ts

import { NORM_SIZE } from "../../../../shared/data/constants";
import { WorldPxPosition } from "../../../../shared/type/playerPosition/posType";
import { ZoneObject } from "../../../../shared/type/zone/ZoneObject";

export class ZoneController {
    private grid: Map<string, ZoneObject[]> = new Map();
    private cellSize: number; // px単位、NORM_SIZE

    constructor(cellSize: number = NORM_SIZE) {
        this.cellSize = cellSize;
    }

    addZone(zone: ZoneObject) {
        const startX = Math.floor(zone.pos.x / this.cellSize);
        const startY = Math.floor(zone.pos.y / this.cellSize);
        const endX = Math.floor((zone.pos.x + zone.w - 1) / this.cellSize);
        const endY = Math.floor((zone.pos.y + zone.h - 1) / this.cellSize);

        for (let cx = startX; cx <= endX; cx++) {
            for (let cy = startY; cy <= endY; cy++) {
                const key = `${cx},${cy}`;
                if (!this.grid.has(key)) this.grid.set(key, []);
                this.grid.get(key)!.push(zone);
            }
        }
    }

    getZonesNearPlayer(playerRect: { pos: WorldPxPosition; w: number; h: number }): ZoneObject[] {
        const startX = Math.floor(playerRect.pos.x / this.cellSize);
        const startY = Math.floor(playerRect.pos.y / this.cellSize);
        const endX = Math.floor((playerRect.pos.x + playerRect.w - 1) / this.cellSize);
        const endY = Math.floor((playerRect.pos.y + playerRect.h - 1) / this.cellSize);

        const zonesSet = new Set<ZoneObject>();
        for (let cx = startX; cx <= endX; cx++) {
            for (let cy = startY; cy <= endY; cy++) {
                const key = `${cx},${cy}`;
                const cellZones = this.grid.get(key);
                if (cellZones) cellZones.forEach(z => zonesSet.add(z));
            }
        }
        return Array.from(zonesSet);
    }

    clear() {
        this.grid.clear();
    }
}
