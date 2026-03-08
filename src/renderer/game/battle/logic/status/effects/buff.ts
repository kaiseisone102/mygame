import { BuffId } from "../../../../../../shared/master/battle/type/BuffPreset ";
import { BuffCategory } from "../../../../../../shared/type/battle/status/BuffCategory";
import type { StackRule } from "../../../../../../shared/type/battle/status/StackRule";
import { Battler } from "../../../core/Battler";

export type Buff = {
    id: BuffId;
    category: BuffCategory;
    value: number;        // 増減量（正は上昇、負は低下）
    turns: number;        // 残りターン
    stackRule: StackRule;  // 同種バフの扱い
    onApply?: (battler: Battler) => void;
    onExpire?: (battler: Battler) => void;
};