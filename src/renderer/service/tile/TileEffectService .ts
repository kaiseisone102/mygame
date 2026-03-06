import { TileData } from "../../game/map/tiles/createTileDatabase";
import { PlayerAbilities } from "../../../shared/type/PlayerAbilitties";
import { TileType } from "../../../shared/type/tileType";
import { TileEffectResult } from "./type/TileEffectResult ";

export class TileEffectService {
    constructor(
        private tileDB: Record<TileType, TileData>
    ) {}

    resolve(
        tileType: TileType,
        context: PlayerAbilities
    ): TileEffectResult {

        const tileData = this.tileDB[tileType];

        if (!tileData) {
            return {
                canWalk: false,
                speedModifier: 1,
                damage: 0,
                encounterModifier: 1,
            };
        }

        // 通行不可
        if (!tileData.walkable) {
            return {
                canWalk: false,
                speedModifier: 1,
                damage: 0,
                encounterModifier: 1,
            };
        }

        // 能力チェック
        if (tileData.requires) {
            const reqs = Array.isArray(tileData.requires)
                ? tileData.requires
                : [tileData.requires];

            const ok = reqs.every(r => context[r]);
            if (!ok) {
                return {
                    canWalk: false,
                    speedModifier: 1,
                    damage: 0,
                    encounterModifier: 1,
                };
            }
        }

        return {
            canWalk: true,
            speedModifier: tileData.speedModifier ?? 1,
            damage: tileData.damage ?? 0,
            encounterModifier: tileData.encounterRateModifier ?? 1,
        };
    }
}
