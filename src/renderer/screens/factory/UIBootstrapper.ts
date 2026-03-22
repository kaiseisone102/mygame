// src/renderer/screens/factory/UIBootstrapper.ts

import { ScreenManager } from "../ScreenManager";
import { UIEventRouter } from "../../router/UIEventRouter";
import { WorldEventRouter } from "../../router/WorldEventRouter";
import { ScreenInitContext } from "../interface/context/ScreenInitContext";
import { MainScreenType } from "../../../shared/type/screenType";

export class UIBootstrapper {
    /**
     * UI・スクリーン・ルーターの複雑な依存関係を構築します
     */
    static setup(params: {
        root: HTMLElement,
        mainScreens: any,
        overlayScreen: any,
        gameState: any,
        inputSystem: any,
        worldManager: any,
        worldQueryBus: any,
        playerAssets: any,
        tileRenderer: any,
        config: any,
    }) {
        const { root, mainScreens, overlayScreen, gameState, inputSystem, worldManager, worldQueryBus, playerAssets, tileRenderer, config } = params;

        // 1. ScreenManager の生成
        const screenManager = new ScreenManager(
            root,
            mainScreens,
            overlayScreen,
            {} as ScreenInitContext, // 後でセット
            gameState,
            inputSystem
        );

        // 2. ルーターの構築
        const uiRouter = new UIEventRouter(screenManager);
        const worldRouter = new WorldEventRouter(screenManager, gameState);

        // 3. ScreenInitContext (スクリーンに渡す共通インターフェース) の作成
        const initCtx: ScreenInitContext = {
            assets: { player: playerAssets },
            tileRenderer,
            gameState,
            getConfig: () => config, // 必要に応じて外部から注入
            emitWorld: (event) => worldRouter.dispatch(event),
            emitUI: (event) => uiRouter.dispatch(event),
            emitBattle: (event) => mainScreens[MainScreenType.BATTLE_ENEMY_SCREEN].handleUIEvent(event),
            querySync: (event) => worldQueryBus.dispatch(event),
            queryAsync: (event) => worldQueryBus.dispatchAsync(event),
            selectedSlotId: () => gameState.selectedSlotId,
            worldManager,
        };

        // 4. コンテキストの注入
        screenManager.setContext(initCtx);
      
        return {
            screenManager,
            uiRouter,
            worldRouter,
            initCtx
        };
    }
}