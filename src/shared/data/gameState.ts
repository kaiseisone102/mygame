// src/shared/data/gameState.ts

import { BattleState, createInitialBattleState } from "../../renderer/game/battle/core/BattleState";
import { SkillId } from "../master/battle/type/SkillPreset";
import { SaveData } from "../save/SaveData";
import { MapId } from "../type/MapId";
import { PlayerPxPosition, WorldPxPosition } from "../type/playerPosition/posType";
import { BattlerSaveData } from "./BattlerSaveData";
import { BaseStats, DEFAULT_COLLECTED_ITEMS, DEFAULT_EVENTFLAG, DEFAULT_PLAYER_BASE_STATS, DEFAULT_PLAYER_EXP, DEFAULT_PLAYER_GOLD, DEFAULT_PLAYER_LEVEL, DEFAULT_PLAYER_NAME, DEFAULT_START_MAP_ID, DEFAULT_START_POSITION_BY_WORLD, SAVE_VERSION } from "./playerConstants";

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

    playerName: string = DEFAULT_PLAYER_NAME; // 初期値を設定
    level: number = DEFAULT_PLAYER_LEVEL;
    exp: number = DEFAULT_PLAYER_EXP;
    gold: number = DEFAULT_PLAYER_GOLD;

    // 戦闘用ステータス
    baseStats: BaseStats = DEFAULT_PLAYER_BASE_STATS;

    // 戦闘システム拡張用（オプション）
    statusEffects: string[] = []; // 状態異常やバフ/デバフ
    skills: SkillId[] = [];        // 覚えているスキル

    // 装備やアイテム
    equipment: Record<string, boolean> = {};
    items: Record<string, number> = {};

    currentMapId: MapId = DEFAULT_START_MAP_ID;
    where: PlayerPxPosition = structuredClone(DEFAULT_START_POSITION_BY_WORLD)

    abilities: {
        swim: boolean,   // ← 最初は泳げないとか？
    } = { swim: true };

    eventFlags: { [world in MapId]?: Record<string, boolean> } = structuredClone(DEFAULT_EVENTFLAG);
    collectedItems: Record<string, boolean> = structuredClone(DEFAULT_COLLECTED_ITEMS);

    playerPos: PlayerPxPosition = structuredClone(DEFAULT_START_POSITION_BY_WORLD);

    currentBattleState?: BattleState;
    battleReturn?: { mapId: MapId, pos: WorldPxPosition };

    party: BattlerSaveData[] = [];

    constructor(public saveFileId: number) { }

    // 戦闘後の味方データを反映
    applyBattleResult(allies: BattlerSaveData[]) {
        this.party = allies;

        // メインプレイヤーのHP/MP/EXP はパーティの先頭を使う
        if (allies.length > 0) {
            const main = allies[0];
            this.baseStats.hp = main.baseStats.hp;
            this.baseStats.mp = main.baseStats.mp;
            this.level = main.level;
            this.exp = main.exp;
        }
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
            level: this.level,
            exp: this.exp,
            gold: this.gold,

            // 戦闘用ステータス
            baseStats: this.baseStats,

            // 戦闘システム拡張用（オプション）
            statusEffects: this.statusEffects,
            skills: this.skills,

            // 装備やアイテム
            equipment: this.equipment,
            items: this.items,

            currentMapId: this.currentMapId,
            where: this.where,

            abilities: this.abilities,

            eventFlags: this.eventFlags,
            collectedItems: this.collectedItems,

            playerPos: this.playerPos,

            currentBattleState: this.currentBattleState,
            battleReturn: this.battleReturn,
            party: this.party,
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
        this.level = save.level;
        this.exp = save.exp;
        this.gold = save.gold;

        this.baseStats = save.baseStats;

        this.statusEffects = save.statusEffects ?? [];
        this.skills = save.skills ?? [];
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

        this.playerPos = save.playerPos;

        this.currentBattleState = save.currentBattleState;
        this.battleReturn = save.battleReturn;
        this.party = this.party;
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
        this.playerName = name && name.trim() !== ""
            ? name
            : DEFAULT_PLAYER_NAME;
    }

    /**
     * 現在アクティブなワールドを変更する
     * - 画面遷移や WorldManager の更新は UseCase 側で行う
     */
    setWorld(mapId: MapId) {
        this.currentMapId = mapId;
    }

    /**
     * 現在アクティブなワールドを取得
     */
    getWorld(): MapId {
        return this.currentMapId;
    }

    /**
     * 指定ワールドのプレイヤー座標を記録する
     *
     * - ワールド切替時
     * - 戦闘復帰時
     * などで使用
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
        return this.playerPos[this.currentMapId];
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
        this.level = DEFAULT_PLAYER_LEVEL;
        this.exp = DEFAULT_PLAYER_EXP;
        this.gold = DEFAULT_PLAYER_GOLD;

        this.baseStats = DEFAULT_PLAYER_BASE_STATS;

        this.statusEffects = [];
        this.skills = [];
        this.equipment = {};
        this.items = {};

        this.currentMapId = DEFAULT_START_MAP_ID;
        this.where = structuredClone(DEFAULT_START_POSITION_BY_WORLD);

        this.abilities = { swim: false };

        this.eventFlags = structuredClone(DEFAULT_EVENTFLAG);
        this.collectedItems = structuredClone(DEFAULT_COLLECTED_ITEMS);

        this.playerPos = structuredClone(DEFAULT_START_POSITION_BY_WORLD);

        this.currentBattleState = createInitialBattleState();
        this.battleReturn = { mapId: this.currentMapId, pos: this.playerPos[this.currentMapId] };
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
