export type EnemySkill = {
    id: string;
    name: string;
    type: "ATTACK" | "MAGIC";

    mpCost: number;

    target: "SINGLE" | "ALL";
};
