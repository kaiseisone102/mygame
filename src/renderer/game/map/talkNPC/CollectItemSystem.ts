import { WorldPxPosition } from "../../../../shared/type/playerPosition/posType";
import { getPlayerTalkRect } from "../../../../renderer/module/debug/debugDrawPlayerHitbox";
import { NORM_SIZE } from "../../../../shared/data/constants";
import { PlayerState } from "../../../../shared/type/PlayerState";
import { RectPx } from "../objects/rect";
import { ItemData } from "./ItemData";
import { rectsOverlap } from "./TalkNPCSystem";

function isFacingItem(
    playerState: PlayerState,
    playerPos: WorldPxPosition,
    item: ItemData
): boolean {

    // プレイヤーの「アクション用」矩形
    const actionRect: RectPx = getPlayerTalkRect(playerPos, playerState);

    // アイテムの矩形
    const itemRect: RectPx = {
        pos: { x: item.pos.x, y: item.pos.y },
        w: (item.w ?? NORM_SIZE),
        h: (item.h ?? NORM_SIZE),
    };

    // 宝箱は向き必須
    // if (item.type === "chest") {
    //     return rectsOverlap(actionRect, itemRect)
    //         && isFacingDirection(playerState.direction, actionRect, itemRect);
    // }

    // 通常アイテムは重なればOK
    return rectsOverlap(actionRect, itemRect);
}

export function tryCollectItem(
    state: PlayerState,
    playerPos: WorldPxPosition,
    items: ItemData[]
): ItemData | null {

    const item = items.find(item =>
        isFacingItem(state, playerPos, item)
    );

    if (item) {
        console.log("🎁 Item collected:", item.type);
        return item;
    }

    return null;
}
