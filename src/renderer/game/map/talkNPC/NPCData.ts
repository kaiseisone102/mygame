
import { ImageKey } from "../../../../shared/type/ImageKey";
import { WorldPxPosition, WorldTilePosition } from "../../../../shared/type/playerPosition/posType";
import { AppDirection } from "../../../../shared/type/PlayerState";

export type NpcData = {
    id: string;
    pos: WorldPxPosition;
    w: number;
    h: number;
    direction: AppDirection;

    roles: string[];
    messageId: string;
    image?: string;
    shopId?: string;
};

export type NpcTileDto = {
    id: string;
    pos: WorldTilePosition;
    tw: number;
    th: number;
    direction: AppDirection;

    roles: string[];
    messageId: string;
    image?: ImageKey;
    shopId?: string;
}