// src/renderer/game/battle/logic/traits/index.ts

import { resistMagic } from "./damage/resistMagic";
import { weakFire } from "./damage/weakFire";
import { halfBreath } from "./damage/halfBreath";
import { autoRegen } from "./regen/autoRegen";
import { mpCostDown } from "./mp/mpCostDown";

/**
 * Trait をまとめる index.ts
 */
export const TRAITS = {
  resistMagic,
  weakFire,
  halfBreath,
  autoRegen,
  mpCostDown,
};
