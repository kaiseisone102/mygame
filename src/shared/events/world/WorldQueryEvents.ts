import { GameConfig } from "../../config/GameConfig";
import { SlotViewModel } from "../../../renderer/screens/viewModel/SlotViewModel";

/* ======================
   Sync
====================== */

export type WorldQuerySyncMap = {
    GET_CURRENT_SLOT_ID: number;
    GET_ACTIVE_OVERLAY_TYPE: string | null;
};

export type WorldQuerySyncEvent = {
    [K in keyof WorldQuerySyncMap]: { type: K }
}[keyof WorldQuerySyncMap];

/* ======================
   Async
====================== */

export type WorldQueryAsyncMap = {
    GET_CONFIG: GameConfig;
    GET_SLOT_VIEW: SlotViewModel;
};

export type WorldQueryAsyncPayload = {
    GET_CONFIG: {};
    GET_SLOT_VIEW: { slotId: number };
};

export type WorldQueryAsyncEvent = {
    [K in keyof WorldQueryAsyncMap]:
        { type: K } & WorldQueryAsyncPayload[K]
}[keyof WorldQueryAsyncMap];
