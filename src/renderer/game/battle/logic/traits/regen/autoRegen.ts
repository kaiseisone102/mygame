// regen/autoRegen.ts
import type { Trait } from "../../../../../../shared/type/battle/trait/Trait";

export const autoRegen: Trait = {
    id: "auto_regen",
    tags: ["AUTO_REGEN"],

    onTurnStart(battler) {
        battler.hp = Math.min(battler.maxHp, battler.hp + 3);
    },
};
