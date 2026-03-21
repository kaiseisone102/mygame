// src/shared/battle/status/logic/sleepLogic.ts


// 😴 sleepLogic
export function sleepLogic(recoverRate: number) {
    return {
        // 行動不能か？
        onBeforeAction: () => false,
        // 確率解除の判定
        shouldExpire: () => Math.random() < recoverRate,
    };
}
