// src/render/screens/router/EventBus.ts

// EventBus.ts
// --------------------------------------------------
// 役割:
// ・イベント名と payload を疎結合でつなぐための EventBus
// ・イベントの発行（emit）と購読（on）を仲介する
// ・Events 型を使って「イベント名 ↔ payload 型」を型安全に保証する
//
// 目的:
// ・画面 / ロジック / ドメイン間の直接依存をなくす
// ・イベント駆動で処理を連携できるようにする
// --------------------------------------------------


// 各イベントに対応するハンドラの型
// payload を1つ受け取る関数
type EventHandler<T> = (payload: T) => void;

// Events:
// {
//   EVENT_NAME: PayloadType
// }
// の形を想定した、汎用 EventBus
export class EventBus<Events extends Record<string, any>> {

    // イベント名ごとにハンドラ配列を保持する
    // {
    //   EVENT_A: [handler1, handler2],
    //   EVENT_B: [handler3]
    // }
    private handlers: {
        [K in keyof Events]?: EventHandler<Events[K]>[];
    } = {};

    // --------------------------------------------------
    // イベント購読
    // --------------------------------------------------
    // 指定したイベント(type)が emit されたときに
    // handler が呼ばれるよう登録する
    on<K extends keyof Events>(type: K, handler: EventHandler<Events[K]>) {
        (this.handlers[type] ??= []).push(handler);
    }

    // --------------------------------------------------
    // イベント発行
    // --------------------------------------------------
    // 指定したイベント(type)を payload 付きで発行し、
    // 登録済みの handler をすべて呼び出す
    emit<K extends keyof Events>(type: K, payload: Events[K]) {
        this.handlers[type]?.forEach(h => h(payload));
    }
}
