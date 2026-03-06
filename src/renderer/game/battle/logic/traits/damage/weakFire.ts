// damage/weakFire.ts
import type { Trait } from "../../../../../../shared/type/battle/trait/Trait";

export const weakFire: Trait = {
  id: "weak_fire",
  tags: ["WEAK_FIRE"],

  onDamage(ctx) {
    if (ctx.skill?.id === "fire") {
      return Math.floor(ctx.damage * 2);
    }
    return ctx.damage;
  },
};
