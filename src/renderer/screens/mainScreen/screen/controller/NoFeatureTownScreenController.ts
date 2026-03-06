// src/renderer/screens/mainScreens/screen/controller/TownScreenController.ts

import { CameraController } from "../../../../../renderer/game/camera/CameraController";
import { WorldDefinition } from "../../../../../renderer/game/map/MapData/definition/WorldDefinition";
import { ObjectLayer } from "../../../../../renderer/game/map/objects/objectLayer";
import { ItemData } from "../../../../../renderer/game/map/talkNPC/ItemData";
import { NpcData } from "../../../../../renderer/game/map/talkNPC/NPCData";
import { SignData } from "../../../../../renderer/game/map/talkNPC/SignData";
import { WorldManager } from "../../../../../renderer/game/map/WorldManager";
import { PlayerAnimator } from "../../../../../renderer/game/player/PlayerAnimator";
import { PlayerController } from "../../../../../renderer/game/player/PlayerController";
import { applyTileDamage } from "../../../../../renderer/game/player/PlayerStatusSystem";
import { WorldRenderer } from "../../../../../renderer/game/world/WorldRenderer";
import { InputFrame } from "../../../../../renderer/input/frame/InputFrame";
import { GameActionEvent, InputAxis, UIActionEvent } from "../../../../../renderer/input/mapping/InputMapper";
import { AppUIEvent } from "../../../../../renderer/router/AppUIEvents";
import { WorldEvent } from "../../../../../renderer/router/WorldEvent";
import { ScreenInitContext } from "../../../../../renderer/screens/interface/context/ScreenInitContext";
import { MainScreenController } from "../../../../../renderer/screens/interface/controller/MainScreenController";
import { TileEffectService } from "../../../../service/tile/TileEffectService ";
import { Camera } from "../../../../../shared/core/camera";
import { World } from "../../../../../shared/core/world";
import { NORM_SIZE } from "../../../../../shared/data/constants";
import { GameState } from "../../../../../shared/data/gameState";
import { MapId } from "../../../../../shared/type/MapId";
import { AppDirection, PlayerMotionType, PlayerState } from "../../../../../shared/type/PlayerState";
import { ZonePx } from "../../../../../shared/type/ZonePx";
import { OverlayScreenType } from "../../../../../shared/type/screenType";

export class NoFeatureTownScreenController implements MainScreenController {
    // ====================
    // DOM / 描画関連
    // ====================
    private screen!: HTMLElement;
    private viewport!: HTMLElement;
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;

    private playerEl!: HTMLElement;
    private playerAnimator!: PlayerAnimator;
    private zonePx: ZonePx[] = [];
    private npcs: NpcData[] = [];
    private signs: SignData[] = [];
    private items: ItemData[] = [];

    private lastPlayerState: PlayerState = { type: typeof PlayerMotionType.IDLE, direction: AppDirection.DOWN };
    private lastPlayerPos!: { tx: number; ty: number };

    // ====================
    // ゲームロジック
    // ====================
    private world!: World;
    private objectLayer!: ObjectLayer;

    private playerController!: PlayerController;
    private cameraController!: CameraController;
    private worldRenderer!: WorldRenderer;

    private emitWorld?: (event: WorldEvent) => void;
    private emitUI?: (event: AppUIEvent) => void;

    constructor(
        private gameState: GameState,
        private tileEffectService: TileEffectService,
        private worldManager: WorldManager
    ) { }

    init(root: HTMLElement, initCtx: ScreenInitContext) {
        this.emitWorld = initCtx.emitWorld;
        this.emitUI = initCtx.emitUI;

        // プレイヤーアニメーター初期化
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
        this.screen.id = "townScreen";
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
        // Renderer / Controller
        // ====================
        this.worldRenderer = new WorldRenderer(this.ctx, initCtx.tileRenderer, true);
    }

    show() {
        this.screen.style.display = "block";
    }

    hide() {
        this.screen.style.display = "none";
    }

    update(delta: number, frame: InputFrame) {
        if (this.screen.style.display === "none") return;

        // 現在のプレイヤー座標
        const pos = this.gameState.where.NO_FEATURE_TOWN;

        // PlayerController が inputState を元に移動と向きを計算
        const result = this.playerController.update(pos, frame.gameAxisIntents, delta);
        // PlayerController が inputState を元に移動と向きを計算
        const state = result.state;
        const moveResult = result.moveResult;

        // ★ 保存
        this.lastPlayerState = state;
        this.lastPlayerPos = pos;

        // カメラ追従
        this.cameraController.followPlayer(pos.tx, pos.ty);
        const camera = this.cameraController.getCamera();

        // ワールド描画
        this.worldRenderer.render(this.world, this.objectLayer, camera, pos, this.lastPlayerState, this.zonePx, this.npcs, this.signs, this.items);

        // PlayerAnimator で PlayerState に応じた画像取得
        const image = this.playerAnimator.update(state, delta);

        this.worldRenderer.drawZones(this.zonePx, camera);
        this.worldRenderer.drawNpcs(this.npcs, camera);
        this.worldRenderer.drawSigns(this.signs, camera);
        this.worldRenderer.drawItems(this.items, camera);

        // プレイヤー描画
        this.worldRenderer.drawPlayer(image, pos.tx, pos.ty, camera);

        // 取得したアイテムは消える
        this.items = this.items.filter(
            item => !this.gameState.collectedItems[item.id]
        );

        applyTileDamage(delta, moveResult, {
            onEnter: () => {
                this.worldRenderer.startDamageFlash();
            },
            onLeave: () => {
                this.worldRenderer.stopDamageFlash(); // ★ 解除！
            },
            onTick: (dmg) => {
                // this.gameState.hp -= dmg;
            }
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
                        playerTilePosition: this.lastPlayerPos,
                        npcs: this.npcs,
                        signs: this.signs,
                        items: this.items
                    });
                    console.log("FT:gameActions:", "On")
                    break;

                case "TEST_CHANGE_WORLD":
                    this.emitWorld?.({ type: "CHANGE_WORLD", mapId: MapId.GRAVE_CAVE });
                    break;

                case "TEST_OPEN_OPTION":
                    this.emitUI?.({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.OPTIONS })
                    break;

                case "CANCEL":
                    this.emitUI?.({ type: "GO_SLOT_SELECT" });
                    break;

                case "INVENTORY":
                 this.emitUI?.({ type: "PUSH_OVERLAY", overlay: OverlayScreenType.INVENTORY })
                     break;
            }
        }
    }

    /**
     * ワールドを差し替える
     */
    setWorld(def: WorldDefinition) {
        this.world = def.world;
        this.objectLayer = def.objectLayer;
        this.zonePx = def.zones;

        this.npcs = def.npcs ?? [];
        this.signs = def.signs ?? [];
        this.items = (def.items ?? []).filter(
            (item: ItemData) => !this.gameState.collectedItems[item.id]
        );

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

        // ====================
        // PlayerController生成
        // ====================

        const walkContext = this.gameState.abilities;

        this.playerController = new PlayerController(
            this.world,
            this.objectLayer,
            this.tileEffectService,
            walkContext,
            this.gameState,
            MapId.NO_FEATURE_TOWN
        );

        this.playerController.setZones(this.zonePx);
        this.playerController.setSigns(this.signs);
        this.playerController.setItems(this.items);

        this.lastPlayerPos = { ...this.gameState.where.NO_FEATURE_TOWN };
    }
}
