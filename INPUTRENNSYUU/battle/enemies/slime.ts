import { Battler } from "../core/Battler";
import { weakFire } from "../traits/damage/weakFire";

export const Slime = new Battler({
    id: "slime",
    name: "スライム",
    side: "ENEMY",
    level: 1,
    baseStats: {
        hp: 12,
        maxHp: 12,
        mp: 0,
        maxMp: 0,
        attack: 5,
        defense: 3,
        magic: 0,
        speed: 4,
        alive: true
    },
    traits: [weakFire],
    skills: [],
    growthTable: {} // ここはレベルごとの成長値を設定
});
