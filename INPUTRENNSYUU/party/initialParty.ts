// src/shared/data/party/initialParty.ts

import type { PartyState } from "./PartyState";
import { createHero } from "./partyFactory";

export function createInitialParty(): PartyState {
  return {
    members: [
      createHero(),
      // 将来: createWarrior(), createMage()
    ],
  };
}
