// src/shared/data/gameState.ts

import { BattleState, createInitialBattleState, createInitialParty } from "../../renderer/game/battle/core/BattleState";
import { SaveData } from "../save/SaveData";
import { AllyStatusData } from "../type/ally/AllyStatusData";
import { BattleActor } from "../type/battle/BattleAction";
import { ImageKey } from "../type/ImageKey";
import { MapId } from "../type/MapId";
import { FieldMagicPayload, SkillSelectPayload } from "../type/payload/battle";
import { PlayerPxPosition, WorldPxPosition, WorldTilePosition } from "../type/playerPosition/posType";
import { BattlerSaveData } from "./BattlerSaveData";
import { NORM_SIZE } from "./constants";
import { DEFAULT_COLLECTED_ITEMS, DEFAULT_EVENTFLAG, DEFAULT_PLAYER_BASE_STATS, DEFAULT_PLAYER_EXP, DEFAULT_PLAYER_GOLD, DEFAULT_PLAYER_LEVEL, DEFAULT_PLAYER_NAME, DEFAULT_START_MAP_ID, DEFAULT_START_POSITION_BY_WORLD, SAVE_VERSION } from "./playerConstants";

/**
 * GameState
 * ----------------------------------------
 * ゲーム全体の進行状態・プレイヤー状態を保持する中核エンティティ。
 *
 * - ワールド状態
 * - プレイヤーの能力・所持品
 * - 現在位置／ワールドごとの位置履歴
 * - 戦闘前後の復帰情報
 *
 * UI や UseCase から直接書き換えられるが、
 * 「意味のある単位」で更新するために setter を提供する。
 */
export class GameState {
    version: number = SAVE_VERSION;
    selectedSlotId: number | null = null;

    playerName: string = DEFAULT_PLAYER_NAME;
    gold: number = DEFAULT_PLAYER_GOLD;

    // パーティメンバー（個々のレベル、経験値、ステータスはここが保持する）
    party: BattlerSaveData[] = [];

    // --- 便利アクセサ（主人公の情報をサクッと取りたい時用） ---
    get mainPlayer() {
        return this.party[0];
    }

    get level() { return this.mainPlayer?.level ?? DEFAULT_PLAYER_LEVEL; }
    get exp() { return this.mainPlayer?.exp ?? DEFAULT_PLAYER_EXP; }
    get baseStats() { return this.mainPlayer?.baseStats ?? DEFAULT_PLAYER_BASE_STATS; }
    get skillIds() { return this.mainPlayer?.skillIds ?? []; }

    // アイテム、マップ等のフラグ類
    equipment: Record<string, boolean> = {};
    items: Record<string, number> = {};
    currentMapId: MapId = DEFAULT_START_MAP_ID;
    where: PlayerPxPosition = structuredClone(DEFAULT_START_POSITION_BY_WORLD)
    collectedItems: Record<string, boolean> = structuredClone(DEFAULT_COLLECTED_ITEMS);

    abilities: {
        swim: boolean,   // ← 最初は泳げないとか？
    } = { swim: true };

    eventFlags: { [world in MapId]?: Record<string, boolean> } = structuredClone(DEFAULT_EVENTFLAG);

    currentBattleState?: BattleState;
    battleReturn?: { mapId: MapId, pos: WorldPxPosition };

    constructor(public saveFileId: number) { }

    /**
     * パーティ全員の最新ステータスを UI 表示用の形式で取得する
     */
    getAllyStatusList(): AllyStatusData[] {
        return this.party.map(battler => ({
            instanceId: battler.instanceId,
            name: battler.name,
            // 現状 baseStats に最大値が入っている想定
            // 本来は BattlerSaveData に currentHp などを持たせるのが理想的
            hp: battler.baseStats.hp,
            maxHp: battler.baseStats.maxHp,
            mp: battler.baseStats.mp,
            maxMp: battler.baseStats.maxMp,
            states: battler.statusEffects.map(s => ({
                id: s.statusId,
                duration: s.duration,
                imageKey: ImageKey[s.statusId as keyof typeof ImageKey]
            }))
        }));
    };

    getFieldMagicPayload(): FieldMagicPayload[] {
        // 全員の基本情報を先に作っておく
        const allPartyMembers = this.party.map(p => ({
            actorMasterId: p.actorMasterId,
            instanceId: p.instanceId,
            name: p.name,
            hp: p.baseStats.hp,
            maxHp: p.baseStats.maxHp,
            alive: p.baseStats.hp > 0
        }));

        // キャラクターごとのPayload配列を返す
        return this.party.map(battler => ({
            actorInstanceId: battler.instanceId,
            skillIds: battler.skillIds,
            allies: allPartyMembers // 全員の情報を含める
        }));
    };

    // 戦闘後の味方データを反映
    applyBattleResult(allies: BattlerSaveData[]) {
        this.party = allies;
    }

    /**
     * 部分更新用ユーティリティ
     * - ロード処理
     * - デバッグ用パッチ適用
     * などでまとめて状態を反映するために使用
     */
    apply(patch: Partial<GameState>) {
        Object.assign(this, patch);
    }

    /**
     * 現在の GameState をセーブ用の純データ構造に変換する
     *
     * - クラスやメソッドを含まない
     * - JSON 化できる形のみを返す
     */
    toSaveData(): SaveData {
        return {
            version: this.version,
            playerName: this.playerName,
            gold: this.gold,
            party: this.party, // パーティ全員の状態を保存

            // 装備やアイテム
            equipment: this.equipment,
            items: this.items,
            currentMapId: this.currentMapId,
            where: this.where,
            eventFlags: this.eventFlags,
            collectedItems: this.collectedItems,
            currentBattleState: this.currentBattleState,
            battleReturn: this.battleReturn,
            abilities: this.abilities,
        };
    }

    /**
     * SaveData から GameState を復元する
     *
     * - 一度 reset() してからロードすることで
     *   古い状態の混入を防ぐ
     */
    load(save: SaveData) {
        this.reset();

        this.version = save.version;
        this.playerName = save.playerName;
        this.gold = save.gold;
        this.party = save.party ?? [];

        this.equipment = save.equipment ?? [];
        this.items = save.items ?? [];
        this.currentMapId = save.currentMapId;
        this.where = save.where;
        this.abilities = this.abilities = {
            ...this.createDefaultAbilities(),
            ...save.abilities
        };
        this.eventFlags = save.eventFlags;
        this.collectedItems = save.collectedItems;
        this.currentBattleState = save.currentBattleState;
        this.battleReturn = save.battleReturn;

        // playername = プレイヤの名前に確実になるようにする
        this.setPlayerName(this.playerName)
    }

    /**
     * セーブスロット選択
     * - 実際のロード／セーブ処理の前段階で使用
     */
    selectSlot(slotId: number) {
        this.selectedSlotId = slotId;
    }

    /**
     * セーブスロット選択解除
     */
    clearSlot() {
        this.selectedSlotId = null;
    }

    /**
     * プレイヤー名設定
     * - 空文字や未指定時はデフォルト名にフォールバック
     */
    setPlayerName(name?: string) {
        const newName = name && name.trim() !== ""
            ? name
            : DEFAULT_PLAYER_NAME;

        this.playerName = newName;

        // パーティが存在する場合、先頭の BattlerSaveData の名前も更新
        if (this.party.length > 0) {
            this.party[0].name = newName;
        }
    }

    /**
     * 現在アクティブなワールドを変更する
     * 遷移先座標があればそれもセットする
     * 移動イベントで利用
     */
    setWorld(mapId: MapId, pos?: WorldTilePosition) {
        this.currentMapId = mapId;
        if (pos) {
            // 特定のマップの座標履歴のみを更新する
            this.where[mapId] = { x: pos.tx * NORM_SIZE, y: pos.ty * NORM_SIZE };
        }
    }

    /**
     * 現在アクティブなワールドを取得
     */
    getWorld(): MapId {
        return this.currentMapId;
    }

    /**
     * 指定ワールドのプレイヤー座標を記録する
     * pos: px座標 計算用
     */
    setPlayerPosition(mapId: MapId, pos: WorldPxPosition) {
        this.where[mapId] = pos;
    }

    /**
     * 現在ワールドにおけるプレイヤー座標を取得
     * - フィールド描画や衝突判定用
     */
    getPlayerPosition(): WorldPxPosition {
        const pos = this.where[this.currentMapId];
        return { x: pos.x, y: pos.y, };
    }

    /**
     * 現在ワールドの保存済みプレイヤー座標を直接取得
     * - シンプルな参照用途
     */
    getCurrentPosition() {
        return this.where[this.currentMapId];
    }

    /**
     * ゲーム状態を初期状態にリセットする
     *
     * - ニューゲーム開始
     * - セーブロード前の初期化
     */
    reset() {
        this.version = SAVE_VERSION;

        this.playerName = DEFAULT_PLAYER_NAME;
        this.gold = DEFAULT_PLAYER_GOLD;
        this.party = createInitialParty();

        this.equipment = {};
        this.items = {};
        this.currentMapId = DEFAULT_START_MAP_ID;
        this.where = structuredClone(DEFAULT_START_POSITION_BY_WORLD);
        this.eventFlags = structuredClone(DEFAULT_EVENTFLAG);
        this.collectedItems = structuredClone(DEFAULT_COLLECTED_ITEMS);
        this.currentBattleState = createInitialBattleState();
        this.battleReturn = { mapId: this.currentMapId, pos: this.where[this.currentMapId] };
        this.abilities = { swim: false };
    }

    /**
     * アイテムを取得する
     * - 初取得フラグも同時に更新
     */
    collectItem(itemId: string, amount: number = 1) {
        if (!this.items[itemId]) this.items[itemId] = 0;
        this.items[itemId] += amount;
        this.collectedItems[itemId] = true;
    }

    /**
     * 指定アイテムを所持しているか確認
     */
    hasItem(itemId: string, amount: number = 1) {
        return (this.items[itemId] ?? 0) >= amount;
    }

    /**
     * アイテムを消費する
     * - 不足している場合は何もしない
     */
    consumeItem(itemId: string, amount: number = 1) {
        if (!this.hasItem(itemId, amount)) return false;
        this.items[itemId] -= amount;
        if (this.items[itemId] <= 0) delete this.items[itemId];
        return true;
    }

    // 戦闘開始時にセットする
    startBattle(state: BattleState) {
        this.currentBattleState = state;
    }

    // 戦闘終了時にクリア
    endBattle() {
        this.currentBattleState = undefined;
    }

    private createDefaultAbilities() {
        return {
            swim: false
        };
    }
}
