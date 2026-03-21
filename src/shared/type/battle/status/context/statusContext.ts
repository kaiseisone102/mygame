// src/shared/type/battle/status/context/StatusContext.ts

import { StatusInstance, StatusPreset } from "../../../../master/battle/StatusPreset";
import { IBattler } from "../../port/BattlerPort";

/**
 * Battlerの最小インターフェース
 */
export interface StatusContext {
/** 状態異常がかかっている対象 (操作メソッドを持つ) */
    readonly target: IBattler;
    
    /** 現在処理中の状態異常インスタンス (残りターン数や蓄積値の参照用) */
    readonly instance: StatusInstance;
    
    /** 状態異常のマスタデータ (名前やカテゴリの参照用) */
    readonly preset: StatusPreset;
}