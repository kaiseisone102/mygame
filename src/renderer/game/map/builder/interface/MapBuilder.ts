// src/renderer/game/map/builder/interface/MapBuilder.ts

import { BaseWorldDefinition } from "./definition/WorldDefinition";

export interface MapBuilder {
    build(): BaseWorldDefinition;
}