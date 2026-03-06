// src/renderer/ui/shakeScreen.ts
export function shakeScreen(screen: HTMLElement | null) {
    if (!screen) return;
    screen.classList.remove("shake");
    void screen.offsetWidth;
    screen.classList.add("shake");
}