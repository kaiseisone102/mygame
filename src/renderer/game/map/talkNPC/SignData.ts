import { WorldPxPosition, WorldTilePosition } from "../../../../shared/type/playerPosition/posType";
import { MessageLogOverlayController } from "../../../../renderer/screens/overlayScreen/screen/controller/MessageLogOverlayController";
import { AppDirection } from "../../../../shared/type/PlayerState";
import { ImageKey } from "../../../../shared/type/ImageKey";

export interface SignData {
    id: string;
    pos: WorldPxPosition;
    w: number;
    h: number;
    facing: AppDirection; // 看板の向き

    message: string;
    image?: ImageKey;
    onRead?: (overlay: MessageLogOverlayController) => Promise<void>;
}

export interface SignTileDto {
    id: string;
    pos: WorldTilePosition;
    tw: number;
    th: number;
    facing: AppDirection; // 看板の向き

    message: string;
    image?: ImageKey;
    onRead?: (overlay: MessageLogOverlayController) => Promise<void>;
}