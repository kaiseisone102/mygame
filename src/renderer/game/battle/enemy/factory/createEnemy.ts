// renderer/game/battle/factory/createEnemy.ts

import { Trait } from "../../../../../shared/type/battle/trait/Trait";
import { BattlerSide } from "../../../../../shared/type/battle/BattleAction";
import { Battler } from "../../core/Battler";
import { EnemyTemplateJson } from "../../../../../shared/Json/enemy/EnemyTemplate";
import { AiType } from "../../../../../shared/master/battle/type/EnemyPreset ";
import { TraitPreset, TraitPresets } from "../../../../../shared/master/battle/TraitPresets";
import { SkillId } from "../../../../../shared/master/battle/type/SkillPreset";

export class BattlerFactory {

    createEnemy(template: EnemyTemplateJson): Battler {

        return new Battler({
            id: template.id,
            name: template.name,
            side: BattlerSide.ENEMY,
            level: template.level,
            exp: template.exp,
            baseStats: {
                hp: template.baseStats.hp,
                maxHp: template.baseStats.hp,
                mp: template.baseStats.mp,
                maxMp: template.baseStats.mp,
                attack: template.baseStats.attack,
                defense: template.baseStats.defense,
                magic: template.baseStats.magic,
                speed: template.baseStats.speed
            },
            growthTable: template.growthTable ?? {},
            skills: template.skills ? toSkillId(template.skills) : [],
            traits: template.traits ? toTraits(template.traits) : [],
            aiType: template.aiType ? toAiType(template.aiType) : AiType.AGGRESSIVE
        });
    }
}

function toSkillId(skills: string[]): SkillId[] {

    return skills.map((s) => {

        const value = SkillId[s as keyof typeof SkillId];

        if (!value) {
            throw new Error(`Invalid SkillId: ${s}`);
        }

        return value;
    });

}

function toTraits(traits: string[]): Trait[] {

    return traits.map((t) => {

        const preset = t as TraitPreset;

        const trait = TraitPresets[preset];

        if (!trait) {
            throw new Error(`Unknown trait: ${t}`);
        }

        return trait;
    });

}

function toAiType(ai: string): AiType {

    const value = AiType[ai as keyof typeof AiType];

    if (!value) {
        throw new Error(`Invalid AiType: ${ai}`);
    }

    return value;
}