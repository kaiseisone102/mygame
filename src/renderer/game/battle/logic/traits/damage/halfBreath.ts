// damage/halfBreath.ts
import type { Trait } from "../../../../../../shared/type/battle/trait/Trait";

export const halfBreath: Trait = {
  id: "half_breath",
  tags: ["HALF_BREATH_DAMAGE"],

  onDamage(ctx) {
    if (ctx.skill?.type === "BREATH") {
      return Math.floor(ctx.damage * 0.5);
    }
    return ctx.damage;
  },
};
