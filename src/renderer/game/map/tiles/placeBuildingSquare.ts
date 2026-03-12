import { TileType } from "../../../../shared/type/tileType";
import { fillRectTile } from "./fillRectTile";
import { World } from "../../../../shared/core/world";

export interface BuildingSquare {
    buildings: Building[];
}

export interface Building {
    id: BuildingSquareId;
    name: string;
    type: string;
    w: number;
    h: number;
    entrance: { x: number, y: number }[];
}

export const BuildingSquareId = {
    BUILDING_LUXURY_SQUARE_01: "building_luxury_square_01", BUILDING_POOR_SQUARE_01: "building_poor_square_01"
} as const;
export type BuildingSquareId = typeof BuildingSquareId[keyof typeof BuildingSquareId];

export function placeBuildingSquare(world: World, baseX: number, baseY: number, b: Building) {

    const x1 = baseX;
    const y1 = baseY;
    const x2 = baseX + b.w - 1;
    const y2 = baseY + b.h - 1;

    fillRectTile(world, x1, x2, y1, y2, TileType.WOOD_FLOOR);

    fillRectTile(world, x1 - 1, x1 - 1, y1 - 1, y2 + 1, TileType.WALL);
    fillRectTile(world, x2 + 1, x2 + 1, y1 - 1, y2 + 1, TileType.WALL);
    fillRectTile(world, x1 - 1, x2 + 1, y1 - 1, y1 - 1, TileType.WALL);

    for (let x = x1 - 1; x <= x2 + 1; x++) {

        let entrance = false;

        for (const e of b.entrance) {

            const ex = baseX + e.x;
            const ey = baseY + e.y;

            if (ex === x && ey === y2 +1) {
                entrance = true;
                fillRectTile(world, x, x, y2 + 1, y2 + 1, TileType.WOOD_FLOOR);
                break;
            }
        }

        if (!entrance) {
            fillRectTile(world, x, x, y2 + 1, y2 + 1, TileType.WALL);
        }
    }
}