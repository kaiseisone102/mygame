// src/renderer/game/map/objects/objectLayer.ts

import { MapObject } from "./objectDatabase";

export interface PlacedObject extends MapObject {
    tx: number; // タイル座標
    ty: number;
}

export class ObjectLayer implements Iterable<PlacedObject> {
    objects: PlacedObject[] = [];

    add(obj: PlacedObject) {
        this.objects.push(obj);
    }

    getAll(): PlacedObject[] {
        return this.objects;
    }

    [Symbol.iterator]() {
        return this.objects[Symbol.iterator]();
    }
}
