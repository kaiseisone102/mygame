// src/renderer/port/UIEventPort.ts

import { AppUIEvent } from "../router/AppUIEvents";

export interface UIEventPort {
    emit(event: AppUIEvent): void;
}