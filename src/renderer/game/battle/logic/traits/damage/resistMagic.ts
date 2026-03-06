// damage/resistMagic.ts

import type { Trait } from "../../../../../../shared/type/battle/trait/Trait";

export const resistMagic: Trait = {
  id: "resist_magic",
  tags: ["RESIST_MAGIC"],

  onDamage(ctx) {
    if (ctx.skill?.type === "MAGIC") {
      return Math.floor(ctx.damage * 0.5);
    }
    return ctx.damage;
  },
};
