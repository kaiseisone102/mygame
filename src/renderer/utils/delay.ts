// src/renderer/utils/delay.ts
export function delay(ms: number): Promise<void> {
    return new Promise(function(resolve) { setTimeout(resolve, ms)});
}