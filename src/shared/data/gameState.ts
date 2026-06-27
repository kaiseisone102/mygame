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
import { BaseStats, DEFAULT_COLLECTED_ITEMS, DEFAULT_EVENTFLAG, DEFAULT_PLAYER_BASE_STATS, DEFAULT_PLAYER_EXP, DEFAULT_PLAYER_GOLD, DEFAULT_PLAYER_LEVEL, DEFAULT_PLAYER_NAME, DEFAULT_START_MAP_ID, DEFAULT_START_POSITION_BY_WORLD, SAVE_VERSION } from "./playerConstants";
import { EquipSlot } from "../type/equipment/EquipSlot";
import { JobId } from "../type/job/JobId";
import { canEquipByJob, EquipmentId, finalStatsOf as computeFinalStats, getEquipmentById } from "../master/battle/EquipmentPreset";
import { JOINABLE_ALLIES, JoinableAllyId } from "./partyJoiners";
import { ItemPresetsById } from "../master/battle/ItemPreset";
import { MaterialId } from "../master/item/MaterialPreset";
import { SkillEffectKindId } from "../type/battle/skill/skillFormula";

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
    _gold: number = DEFAULT_PLAYER_GOLD;

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

    // 未着用の装備在庫(装備ID → 所持数)。着用中の装備は各 BattlerSaveData.equipment が持つ。
    equipment: Record<string, number> = {};
    // 消費アイテム在庫(道具ID → 所持数)。「使えるアイテム」。
    items: Record<string, number> = {};
    // マテリアル(素材)在庫(マテリアルID → 所持数)。コレクション要素。
    materials: Record<string, number> = {};
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
            gold: this._gold,
            party: this.party, // パーティ全員の状態を保存

            // 装備やアイテム
            equipment: this.equipment,
            items: this.items,
            materials: this.materials,
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
        this._gold = save.gold;
        // 旧セーブには job / equipment が無いので既定値を補う
        this.party = (save.party ?? []).map(p => ({
            ...p,
            job: p.job ?? JobId.BRAVER,
            equipment: p.equipment ?? {},
        }));

        this.equipment = this.normalizeCountMap(save.equipment);
        this.items = save.items ?? {};
        this.materials = this.normalizeCountMap(save.materials);
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
        this._gold = DEFAULT_PLAYER_GOLD;
        this.party = createInitialParty();

        // 新規ゲーム時の初期装備在庫(基本は店/拾得だが、最初に試せる分を少し持たせる)
        this.equipment = {
            [EquipmentId.RUSTY_SWORD]: 1,
            [EquipmentId.WOODEN_SHIELD]: 1,
            [EquipmentId.LEATHER_CAP]: 1,
        };
        // 新規ゲーム時の初期道具(セーブロード時は load() 側で上書きされる)
        this.items = { POTION: 3, HIGH_POTION: 1, BOMB: 2 };
        // マテリアル(コレクション)。最初に数個持たせておく。
        this.materials = { [MaterialId.SLIME_GEL]: 3, [MaterialId.IRON_ORE]: 1 };
        this.currentMapId = DEFAULT_START_MAP_ID;
        this.where = structuredClone(DEFAULT_START_POSITION_BY_WORLD);
        this.eventFlags = structuredClone(DEFAULT_EVENTFLAG);
        this.collectedItems = structuredClone(DEFAULT_COLLECTED_ITEMS);
        this.currentBattleState = createInitialBattleState();
        this.battleReturn = { mapId: this.currentMapId, pos: this.where[this.currentMapId] };
        this.abilities = this.createDefaultAbilities();
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

    /* =====================
            装備システム
        ===================== */

    /** 装備在庫(未着用)を持っているか */
    hasEquipment(equipId: string, amount: number = 1): boolean {
        return (this.equipment[equipId] ?? 0) >= amount;
    }

    /** 装備在庫に加える(店購入・拾得・着脱で外した分の戻し) */
    addEquipment(equipId: string, amount: number = 1): void {
        this.equipment[equipId] = (this.equipment[equipId] ?? 0) + amount;
    }

    /** 装備在庫から減らす。不足時は false。 */
    private removeEquipmentFromStock(equipId: string, amount: number = 1): boolean {
        if (!this.hasEquipment(equipId, amount)) return false;
        this.equipment[equipId] -= amount;
        if (this.equipment[equipId] <= 0) delete this.equipment[equipId];
        return true;
    }

    /** instanceId から味方を引く */
    private findPartyMember(instanceId: number): BattlerSaveData | undefined {
        return this.party.find(p => p.instanceId === instanceId);
    }

    /**
     * 装備を着ける。
     * - 在庫に無い / 職が合わない / 装備IDが不正 なら false。
     * - 同じスロットに既装備があれば在庫へ戻す。
     */
    equip(instanceId: number, equipId: string): boolean {
        const member = this.findPartyMember(instanceId);
        if (!member) return false;

        const preset = getEquipmentById(equipId);
        if (!preset) return false;
        if (!this.hasEquipment(equipId)) return false;
        if (!canEquipByJob(preset, member.job)) return false;

        // 在庫から取り出す
        this.removeEquipmentFromStock(equipId);

        // 既装備があれば在庫へ戻す
        const slot = preset.slot;
        const current = member.equipment[slot];
        if (current) this.addEquipment(current);

        // 着用
        member.equipment = { ...member.equipment, [slot]: equipId };

        // maxHp / maxMp が変わるため現在値をクランプ
        this.clampVitals(member);
        return true;
    }

    /** 指定スロットの装備を外して在庫へ戻す。 */
    unequip(instanceId: number, slot: EquipSlot): boolean {
        const member = this.findPartyMember(instanceId);
        if (!member) return false;

        const current = member.equipment[slot];
        if (!current) return false;

        this.addEquipment(current);
        const next = { ...member.equipment };
        delete next[slot];
        member.equipment = next;

        this.clampVitals(member);
        return true;
    }

    /**
     * 装備込みの最終ステータスを返す(ステータス画面・着脱プレビュー用)。
     * 戦闘中は StatCalculator が同じ装備ボーナスを適用するので数値が一致する。
     */
    getFinalStats(instanceId: number): BaseStats | undefined {
        const member = this.findPartyMember(instanceId);
        if (!member) return undefined;
        return computeFinalStats(member.baseStats, member.equipment);
    }

    /** 現在値(hp/mp)が装備込み最大値を超えないように丸める */
    private clampVitals(member: BattlerSaveData): void {
        const final = computeFinalStats(member.baseStats, member.equipment);
        if (member.baseStats.hp > final.maxHp) member.baseStats.hp = final.maxHp;
        if (member.baseStats.mp > final.maxMp) member.baseStats.mp = final.maxMp;
    }

    /**
     * 仲間を加入させる(後から加入する3人用)。
     * - 既に加入済み(同じ actorMasterId)なら何もせず false。
     * - instanceId は現在の最大値+1で採番。
     */
    joinAlly(id: JoinableAllyId): boolean {
        const template = JOINABLE_ALLIES[id];
        if (!template) return false;
        if (this.party.some(p => p.actorMasterId === template.actorMasterId)) return false;

        const nextInstanceId = this.party.reduce((max, p) => Math.max(max, p.instanceId), 0) + 1;
        this.party.push({ ...structuredClone(template), instanceId: nextInstanceId });
        return true;
    }

    /* =====================
            マテリアル(素材)
        ===================== */

    /** マテリアルを所持しているか */
    hasMaterial(materialId: string, amount: number = 1): boolean {
        return (this.materials[materialId] ?? 0) >= amount;
    }

    /** マテリアルを加える(拾得・ドロップ・店購入) */
    addMaterial(materialId: string, amount: number = 1): void {
        this.materials[materialId] = (this.materials[materialId] ?? 0) + amount;
    }

    /* =====================
            道具のフィールド使用
        ===================== */

    /** その道具をフィールドで使えるか(現状は回復系のみ。攻撃系は戦闘中だけ) */
    isFieldUsableItem(itemId: string): boolean {
        const preset = ItemPresetsById[itemId];
        if (!preset || !preset.consumable) return false;
        return preset.effects.some(e => e.type === SkillEffectKindId.HEAL);
    }

    /**
     * フィールドで道具を味方に使う(回復のみ対応)。
     * 成功すれば 1個消費する。結果メッセージを返す。
     */
    useItemOnAlly(itemId: string, instanceId: number): { ok: boolean; message: string } {
        const preset = ItemPresetsById[itemId];
        if (!preset) return { ok: false, message: "それは使えない" };
        if (!this.hasItem(itemId)) return { ok: false, message: `${preset.name}を持っていない` };

        const member = this.findPartyMember(instanceId);
        if (!member) return { ok: false, message: "対象がいない" };

        const healEffect = preset.effects.find(e => e.type === SkillEffectKindId.HEAL);
        if (!healEffect || !("power" in healEffect)) {
            return { ok: false, message: `${preset.name}は戦闘中にしか使えない` };
        }

        const finalStats = computeFinalStats(member.baseStats, member.equipment);
        const before = member.baseStats.hp;
        member.baseStats.hp = Math.min(finalStats.maxHp, member.baseStats.hp + healEffect.power);
        const healed = member.baseStats.hp - before;
        this.consumeItem(itemId, 1);
        return { ok: true, message: `${member.name} のHPが ${healed} かいふくした！` };
    }

    /** 旧形式(boolean マップ / 未定義)も含めて個数マップ(Record<string, number>)に正規化する */
    private normalizeCountMap(raw: unknown): Record<string, number> {
        const out: Record<string, number> = {};
        if (!raw || typeof raw !== "object") return out;
        for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
            if (typeof value === "number" && value > 0) out[key] = value;
            else if (value === true) out[key] = 1; // 旧 Record<string, boolean> からの移行
        }
        return out;
    }

    /**
     * 現在ゴールドを取得
     */
    getAsyncGold(): Promise<number> {
        return Promise.resolve(this._gold);
    }
    getSyncGold(): number {
        return this._gold;
    }

    /**
     * ゴールドを増やす(戦闘報酬・拾得など)
     */
    addGold(amount: number): void {
        this._gold = Math.max(0, this._gold + amount);
    }

    /**
     * ゴールドを消費する(買い物など)。
     * - 残高が足りなければ何もせず false を返す
     */
    spendGold(amount: number): boolean {
        if (amount < 0) return false;
        if (this._gold < amount) return false;
        this._gold -= amount;
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
            swim: true
        };
    }
}
