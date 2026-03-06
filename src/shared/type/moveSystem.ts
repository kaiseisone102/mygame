// src/shared/type/moveSystem.ts
export interface MoveSystem {
  canMove: boolean;
  moved: boolean;
}

export const moveSystem: MoveSystem = {
  canMove: true,
  moved: false,
};
