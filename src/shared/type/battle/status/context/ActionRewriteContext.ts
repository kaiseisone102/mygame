// src/shared/type/battle/status/context/ActionRewriteContext.ts

import { BattlerPort } from "../../port/BattlerPort";

export interface ActionRewriteContext {
    self: BattlerPort;

    /** 自分と同サイド（味方） */
    allies: BattlerPort[];

    /** 敵サイド */
    enemies: BattlerPort[];
}
