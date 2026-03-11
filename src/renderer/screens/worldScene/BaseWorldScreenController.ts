// src/renderer/screens/worldScene/BaseWorldScreenController.ts

import { CameraController } from "../../../renderer/game/camera/CameraController";
import { WorldDefinition } from "../../../renderer/game/map/builder/interface/definition/WorldDefinition";
import { ObjectLayer } from "../../../renderer/game/map/objects/objectLayer";
import { ItemData } from "../../../renderer/game/map/talkNPC/ItemData";
import { NpcData } from "../../../renderer/game/map/talkNPC/NPCData";
import { SignData } from "../../../renderer/game/map/talkNPC/SignData";
import { WorldManager } from "../../../renderer/game/map/WorldManager";
import { PlayerAnimator } from "../../../renderer/game/player/PlayerAnimator";
import { PlayerController } from "../../../renderer/game/player/PlayerController";
import { applyTileDamage } from "../../../renderer/game/player/PlayerStatusSystem";
import { WorldRenderer } from "../../../renderer/game/world/WorldRenderer";
import { InputFrame } from "../../../renderer/input/frame/InputFrame";
import { GameActionEvent, InputAxis, UIActionEvent } from "../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../renderer/router/WorldEvent";
import { TileEffectService } from "../../../renderer/service/tile/TileEffectService ";
import { Camera } from "../../../shared/core/camera";
import { World } from "../../../shared/core/world";
import { NORM_SIZE } from "../../../shared/data/constants";
import { GameState } from "../../../shared/data/gameState";
import { WorldPxPosition } from "../../../shared/type/playerPosition/posType";
import { AppDirection, PlayerMotionType, PlayerState } from "../../../shared/type/PlayerState";
import { OverlayScreenType } from "../../../shared/type/screenType";
import { ZonePx } from "../../../shared/type/ZonePx";
import { ScreenInitContext } from "../interface/context/ScreenInitContext";
import { MainScreenController } from "../interface/controller/MainScreenController";

export abstract class BaseWorldScreenController implements MainScreenController {

    protected screen!: HTMLElement;
    protected viewport!: HTMLElement;
    protected canvas!: HTMLCanvasElement;
    protected ctx!: CanvasRenderingContext2D;

    private playerEl!: HTMLElement;
    protected playerAnimator!: PlayerAnimator;

    protected world!: World;
    protected objectLayer!: ObjectLayer;

    protected zones: ZonePx[] = [];
    protected npcs: NpcData[] = [];
    protected signs: SignData[] = [];
    protected items: ItemData[] = [];

    protected playerController!: PlayerController;
    protected cameraController!: CameraController;
    protected worldRenderer!: WorldRenderer;

    protected emitWorld?: (event: WorldEvent) => void;
    protected emitUI?: (event: AppUIEvent) => void;

    protected lastPlayerState: PlayerState = {
        type: PlayerMotionType.IDLE,
        direction: AppDirection.DOWN
    };

    protected lastPlayerPos: WorldPxPosition = { x: 0, y: 0 };

    constructor(
        protected gameState: GameState,
        protected tileEffectService: TileEffectService,
        protected worldManager: WorldManager
    ) { }

    protected abstract screenId: string;

    init(root: HTMLElement, initCtx: ScreenInitContext) {

        this.emitWorld = initCtx.emitWorld;
        this.emitUI = initCtx.emitUI;

        if (initCtx.assets) {
            this.playerAnimator = new PlayerAnimator(
                initCtx.assets.player.frames,
                initCtx.assets.player.stand
            );
        }

        // ====================
        // DOM生成
        // ====================

        this.screen = document.createElement("div");
        this.screen.id = this.screenId;
        root.appendChild(this.screen);

        this.viewport = document.createElement("div");
        this.viewport.id = "viewport";
        this.screen.appendChild(this.viewport);

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.viewport.clientWidth;
        this.canvas.height = this.viewport.clientHeight;
        this.viewport.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d")!;

        this.playerEl = document.createElement("div");
        this.playerEl.id = "player";
        this.viewport.appendChild(this.playerEl);

        // ====================
        // Renderer
        // ====================

        this.worldRenderer = new WorldRenderer(
            this.ctx,
            initCtx.tileRenderer,
            true
        );
    }

    show() {

        this.screen.style.display = "block";

        this.canvas.width = this.viewport.clientWidth;
        this.canvas.height = this.viewport.clientHeight;

        // ====================
        // Camera生成
        // ====================

        const camera = new Camera(
            this.viewport.clientWidth,
            this.viewport.clientHeight,
            this.world.width * NORM_SIZE,
            this.world.height * NORM_SIZE
        );

        this.cameraController = new CameraController(camera);
    }

    hide() {
        this.screen.style.display = "none";
    }

    update(delta: number, frame: InputFrame) {

        if (this.screen.style.display === "none") return;

        const mapId = this.gameState.currentMapId;
        const playerPos = this.gameState.where[mapId];

        this.lastPlayerPos = { ...playerPos };

        const result = this.playerController.update(
            this.lastPlayerPos,
            frame.gameAxisIntents,
            delta
        );

        // PlayerController が inputState を元に移動と向きを計算
        const state = result.state;
        const moveResult = result.moveResult;

        // ★ 保存
        this.lastPlayerState = state;

        // カメラ追従
        this.cameraController.followPlayer(playerPos);
        const camera = this.cameraController.getCamera();

        // ワールド描画
        this.worldRenderer.render(
            this.world,
            this.objectLayer,
            camera,
            playerPos,
            this.lastPlayerState,
            this.zones,
            this.npcs,
            this.signs,
            this.items
        );

        // PlayerAnimator で PlayerState に応じた画像取得
        const image = this.playerAnimator.update(state, delta);

        this.worldRenderer.drawZones(this.zones, camera);
        this.worldRenderer.drawNpcs(this.npcs, camera);
        this.worldRenderer.drawSigns(this.signs, camera);
        this.worldRenderer.drawItems(this.items, camera);

        // プレイヤー描画
        this.worldRenderer.drawPlayer(image, playerPos, camera);

        // 取得済みアイテム削除
        this.items = this.items.filter(
            item => !this.gameState.collectedItems[item.id]
        );

        applyTileDamage(delta, moveResult, {
            onEnter: () => this.worldRenderer.startDamageFlash(),
            onLeave: () => this.worldRenderer.stopDamageFlash(),
            onTick: () => { }
        });
    }

    gameAxes(axes: InputAxis[]): void {
        for (const axis of axes) {

            switch (axis) {
                case AppDirection.UP:
                    break;
                case AppDirection.DOWN:
                    break;
                case AppDirection.LEFT:
                    break;
                case AppDirection.RIGHT:
                    break;
            }
        }
    }

    gameActions(events: GameActionEvent[]): void {
        for (const e of events) {
            switch (e.action) {
            }
        }
    }

    UIActions(events: UIActionEvent[]): void {

        for (const e of events) {

            switch (e.action) {

                case "CONFIRM":

                    this.emitUI?.({
                        type: "REQUEST_INTERACT",
                        playerState: this.lastPlayerState,
                        playerPos: this.lastPlayerPos,
                        npcs: this.npcs,
                        signs: this.signs,
                        items: this.items
                    });

                    break;
                case "TEST_CHANGE_WORLD":
                    this.emitWorld?.({ type: "CHANGE_WORLD", mapId: this.worldManager.testNextMap() });
                    break;

                case "TEST_OPEN_OPTION":
                    this.emitUI?.({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.OPTIONS, payload: undefined })
                    break;

                case "CANCEL":
                    this.emitUI?.({ type: "GO_SLOT_SELECT" });
                    break;

                case "INVENTORY":
                    this.emitUI?.({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.INVENTORY, payload: undefined })
                    break;
            }
        }
    }

    /**
     * ワールド差し替え
     */
    setWorld(def: WorldDefinition) {

        this.world = def.world;
        this.objectLayer = def.objectLayer;
        this.zones = def.zones;

        this.npcs = def.npcs ?? [];
        this.signs = def.signs ?? [];

        this.items = (def.items ?? []).filter(
            (item: ItemData) => !this.gameState.collectedItems[item.id]
        );

        const currentMapId = this.gameState.currentMapId;

        const walkContext = this.gameState.abilities;

        this.playerController = new PlayerController(
            this.world,
            this.objectLayer,
            this.tileEffectService,
            walkContext,
            this.gameState,
            currentMapId
        );

        this.playerController.setZones(this.zones);
        this.playerController.setNpcs(this.npcs);
        this.playerController.setSigns(this.signs);
        this.playerController.setItems(this.items);
    }
}