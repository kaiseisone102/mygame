/** 目的: 入力の種類を状態で管理 */
export enum InputTriggerType {
    Press,      // 押している間だけ
    Hold,       // 押している間ずっと
    Release,    // 離した瞬間
    Repeat,     // 一定間隔で発火
}