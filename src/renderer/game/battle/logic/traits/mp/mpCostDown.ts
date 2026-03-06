// mp/mpCostDown.ts
import type { Trait } from "../../../../../../shared/type/battle/trait/Trait";

export const mpCostDown = (rate: number): Trait => ({
  id: `mp_cost_down_${rate}`,
  tags: ["MP_COST_DOWN"],

  onMpCost(cost) {
    return Math.max(0, Math.floor(cost * rate));
  },
});
