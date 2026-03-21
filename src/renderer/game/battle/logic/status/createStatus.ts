// src/renderer/game/battle/logic/status/createStatus.ts

import { SkillPreset } from "../../../../../shared/master/battle/type/SkillPreset";
import { StatusId, StatusInstance, StatusPresets } from "../../../../../shared/master/battle/StatusPreset";
import { Battler } from "../../core/Battler";

export function createStatus(statusId: StatusId, actor: Battler, buffValue: number): StatusInstance {

    const base = StatusPresets[statusId];

    if (!base) {
        throw new Error(`StatusPreset not found for id: ${statusId}`);
    }

    // Instance 型に定義されている「動的な値」だけを返す
    return {
        instanceId: actor.instanceId,
        statusId: statusId,           // これを使ってマスタを参照する
        duration: base.duration ?? 1,
        value: buffValue,                     // 必要に応じて計算値を入れる
        actorId: actor.instanceId, // 誰がかけたか（IDで保持するのが安全）
        // skill は必要なら ID だけ保持するか、コンテキストとして利用
    };
}
