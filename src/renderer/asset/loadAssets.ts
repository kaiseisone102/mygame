// src/renderer/bootstrap/loadAssets.ts
import { ImageKey } from "../../shared/type/ImageKey";
import { ImageStore } from "./ImageStore";

// NOTE:
// Electron(file://) 用のため、asset は HTML 相対パスで指定する

export async function loadAssets() {
    await Promise.all([
        // タイル
        ImageStore.load(ImageKey.DIRT, "assets/images/tiles/dirt.gif"),
        ImageStore.load(ImageKey.WOODS, "assets/images/tiles/woods.gif"),
        ImageStore.load(ImageKey.PLAIN, "assets/images/tiles/plain.gif"),
        ImageStore.load(ImageKey.SKY, "assets/images/tiles/sky.gif"),
        ImageStore.load(ImageKey.WALL, "assets/images/tiles/wall.gif"),
        ImageStore.load(ImageKey.WATER, "assets/images/tiles/water.gif"),
        ImageStore.load(ImageKey.DARK, "assets/images/tiles/cave/dark.png"),
        // 洞窟
        ImageStore.load(ImageKey.CAVEWALL, "assets/images/tiles/cave/caveWall.png"),
        ImageStore.load(ImageKey.CAVEFLOOR, "assets/images/tiles/cave/caveFloor.png"),

        // オブジェクト
        ImageStore.load(ImageKey.TREE, "assets/images/objects/tree.gif"),
        ImageStore.load(ImageKey.THRONE, "assets/images/objects/tree.gif"),

        // プレイヤーキャラ
        ImageStore.load(ImageKey.PLAYER_STAND_LEFT, "assets/walkingPlayer/standLeft.png"),
        ImageStore.load(ImageKey.PLAYER_STAND_RIGHT, "assets/walkingPlayer/standRight.png"),
        ImageStore.load(ImageKey.PLAYER_LEFT_1, "assets/walkingPlayer/left_1.png"),
        ImageStore.load(ImageKey.PLAYER_LEFT_2, "assets/walkingPlayer/left_2.png"),
        ImageStore.load(ImageKey.PLAYER_LEFT_0, "assets/walkingPlayer/left_0.png"),
        ImageStore.load(ImageKey.PLAYER_RIGHT_1, "assets/walkingPlayer/right_1.png"),
        ImageStore.load(ImageKey.PLAYER_RIGHT_2, "assets/walkingPlayer/right_2.png"),
        ImageStore.load(ImageKey.PLAYER_RIGHT_0, "assets/walkingPlayer/right_0.png"),

        // ----- zone ------ // 
        // 建物 
        ImageStore.load(ImageKey.TOWN_ICON, "assets/images/zone/building/town.png"),
        // 敵
        ImageStore.load(ImageKey.ENEMY_ICON, "assets/images/zone/enemy/enemy1.png"),
        // エリア
        ImageStore.load(ImageKey.AREA_ICON, "assets/images/zone/area/skipArea.png"),
        // 人
        ImageStore.load(ImageKey.PLAYER_STAND_LEFT, "assets/walkingPlayer/standLeft.png"),
        // 看板
        ImageStore.load(ImageKey.WOODEN_SIGN, "assets/images/sign/woodenSign.png"),
        // アイテム
        ImageStore.load(ImageKey.GOLD_ICON, "assets/images/items/goldIcon.png"),
        ImageStore.load(ImageKey.POTION_ICON, "assets/images/items/potionIcon.png"),

    ]);
}
