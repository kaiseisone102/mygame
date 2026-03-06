// src/renderer/utils/blinkLoop.ts

import { delay } from "./delay";

export function blinkText(
    el: HTMLElement,
    interval = 800
) {
    const controller = new AbortController();

    blinkLoop(controller, {
        interval,
        on: () => el.style.display = "block",
        off: () => el.style.display = "none",
    });

    return controller;
}

type BlinkOptions = {
    interval: number; // 1周期(ms)
    on?: () => void;
    off?: () => void;
    initialState?: "on" | "off";
};

function blinkLoop(
    controller: AbortController,
    options: BlinkOptions
) {
    const {
        interval,
        on,
        off,
        initialState = "on",
    } = options;
    let visible = initialState === "on";
    const run = async () => {
        while (!controller.signal.aborted) {
            visible ? on?.() : off?.();
            await delay(interval / 2);
            visible = !visible;
        }
    }
    run();
}

////////////////////////////////////////////////////
// const blinkCtrl = blinkText(this.pressEnter);
// // 停止
// blinkCtrl.abort();
////////////////////////////////////////////////////
// <---- 文字点滅用の使い方（今まで通り） ---->
// const controller = new AbortController();
//
// blinkLoop(controller, {
//     interval: 800,
//     on: () => pressEnter.style.display = "block",
//     off: () => pressEnter.style.display = "none",
// });
/////////////////////////////////////////////////////
// <---- opacity で点滅させる例 ----> 
// blinkLoop(controller, {
//     interval: 600,
//     on: () => target.style.opacity = "1",
//     off: () => target.style.opacity = "0",
// });
/////////////////////////////////////////////////////
// <---- class 切り替え（CSS管理）←おすすめ ---->
// blinkLoop(controller, {
//     interval: 700,
//     on: () => target.classList.add("visible"),
//     off: () => target.classList.remove("visible"),
// });
//
// .visible {
//     opacity: 1;
// }
/////////////////////////////////////////////////////