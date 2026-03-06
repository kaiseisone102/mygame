// src/shared/data/party/partyFactory.ts

import { Battler, LevelGrowthTable } from "../../battle/core/Battler";
import { Trait } from "../../battle/traits/Trait";
type StatGrowth = {
hp: number,
    mp: number,
    attack: number,
    defense: number,
    magic: number,
    speed: number,
}
// ===== 成長テーブル =====
const baseGrowth: LevelGrowthTable = {
    2: { hp: 10, mp: 5, attack: 3, defense: 2, magic: 2, speed: 1 },
    3: { hp: 12, mp: 6, attack: 4, defense: 2, magic: 3, speed: 1 },
};

// ===== キャラクターごとの成長補正 =====
const heroModifier: StatGrowth = {
    hp: 1.1,
    mp: 1.0,
    attack: 1.2,
    defense: 1.0,
    magic: 1.1,
    speed: 1.0,
};

const magicianModifier: StatGrowth = {
    hp: 1.0,
    mp: 1.2,
    attack: 1.0,
    defense: 1.0,
    magic: 1.3,
    speed: 1.1,
};

const healerModifier: StatGrowth = {
    hp: 1.05,
    mp: 1.1,
    attack: 1.0,
    defense: 1.0,
    magic: 1.2,
    speed: 1.0,
};

// ===== キャラクター生成関数 =====

export function createHero(): Battler {
    return new Battler({
        id: "hero",
        name: "勇者",
        side: "ALLY",
        level: 1,
        growthTable: baseGrowth,
        statModifier: 1,
        skills: ["attack", "defend"],
        traits: [],
        baseStats: {
            hp: 100,
            mp: 30,
            attack: 15,
            defense: 5,
            magic: 8,
            speed: 10,
        },
    });
}

export function createMagician(): Battler {
    return new Battler({
        id: "magician",
        name: "魔法使い",
        side: "ALLY",
        level: 1,
        growthTable: baseGrowth,
        statModifier: 1,
        skills: ["fireball", "iceSpike"],
        traits: [],
        baseStats: {
            hp: 60,
            mp: 50,
            attack: 5,
            defense: 3,
            magic: 12,
            speed: 8,
        },
    });
}

export function createHealer(): Battler {
    return new Battler({
        id: "healer",
        name: "僧侶",
        side: "ALLY",
        level: 1,
        growthTable: baseGrowth,
        statModifier: 1,
        skills: ["heal", "protect"],
        traits: [],
        baseStats: {
            hp: 70,
            mp: 40,
            attack: 4,
            defense: 4,
            magic: 10,
            speed: 9,
        },
    });
}
