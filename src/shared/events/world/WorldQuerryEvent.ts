// src/shared/events/world/WorldQueryEvents.ts

export type WorldQuerySyncEvent =
    | { type: "GET_CURRENT_SLOT_ID" }
    | { type: "GET_ACTIVE_OVERLAY_TYPE" }

export type WorldQueryAsyncEvent =
    | { type: "GET_CONFIG" }
    | { type: "GET_SLOT_VIEW"; slotId: number }
