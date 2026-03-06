// src/renderer/game/map/repository/MapRepository.ts

import { MapJson } from "../../../../shared/map/MapJson";
import { MapId } from "../../../../shared/type/MapId";

export class MapRepository {

  // NOTE:
  // Electron(file://) 用のため、asset は HTML 相対パスで指定する
  async load(mapId: MapId): Promise<MapJson> {
    const response = await fetch(`maps/${mapId.toLowerCase()}.json`);

    if (!response.ok) {
      throw new Error("Failed to load map: " + mapId);
    }

    return response.json();
  }
}
