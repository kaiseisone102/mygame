import { getPlayerTalkRect } from "../../../../../renderer/module/debug/debugDrawPlayerHitbox";
import { MessageLogOverlayController } from "../../../../../renderer/screens/overlayScreen/screen/controller/MessageLogOverlayController";
import { NORM_SIZE } from "../../../../../shared/data/constants";
import { GameState } from "../../../../../shared/data/gameState";
import { PlayerState } from "../../../../../shared/type/PlayerState";
import { RectPx, RectTile } from "../../objects/rect";
import { SignData } from "../SignData";
import { rectsOverlap } from "../TalkNPCSystem";
import { AppDirection } from "../../../../../shared/type/PlayerState";

function canReadSign(playerRect: RectPx, playerFacing: string, sign: SignData): boolean {
    const signRect: RectPx = {
        pos: { x: sign.pos.x, y: sign.pos.y},
        w: (sign.w ?? 1) ,
        h: (sign.h ?? 1) ,
    };

    if (!rectsOverlap(playerRect, signRect)) return false;

    // 向き判定
    const facingOK =
        (playerFacing === AppDirection.UP && sign.facing === AppDirection.DOWN) ||
        (playerFacing === AppDirection.DOWN && sign.facing === AppDirection.UP) ||
        (playerFacing === AppDirection.LEFT && sign.facing === AppDirection.RIGHT) ||
        (playerFacing === AppDirection.RIGHT && sign.facing === AppDirection.LEFT);
    return facingOK;
}

export function tryReadSign(
    gameState: GameState,
    playerState: PlayerState,
    signs: SignData[],
    overlay: MessageLogOverlayController
) {
    const playerPos = gameState.getPlayerPosition();
    const talkRect: RectPx = getPlayerTalkRect(playerPos, playerState);

    const sign = signs.find(s => canReadSign(talkRect, playerState.direction, s));

    if (sign) {
        console.log(`📜 Sign read at (${sign.pos.x}, ${sign.pos.y}), facing: ${sign.facing}`);
        sign.onRead?.(overlay);
    } else {
        console.log("❌ no sign in front");
    }
}
