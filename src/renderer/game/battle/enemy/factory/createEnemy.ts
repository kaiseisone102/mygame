// renderer/game/battle/factory/createEnemy.ts

import { Trait } from "../../../../../shared/type/battle/trait/Trait";
import { BattlerSide } from "../../../../../shared/type/battle/BattleAction";
import { Battler } from "../../core/Battler";
import { EnemyTemplateJson } from "../../../../../shared/Json/enemy/EnemyTemplateJson";
import { AiType } from "../../../../../shared/master/battle/type/EnemyPreset ";
import { TraitPresets } from "../../../../../shared/master/battle/TraitPresets";
import { SkillId } from "../../../../../shared/master/battle/type/SkillPreset";
import { ImageKey } from "../../../../../shared/type/ImageKey";

export class BattlerFactory {

    private instanceCounter = 100;

    createEnemy(template: EnemyTemplateJson): Battler {

        return new Battler({
            templateId: template.templateId,
            instanceId: this.instanceCounter++,
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
            aiType: template.aiType ? toAiType(template.aiType) : AiType.AGGRESSIVE,
            imageKey: template.imageKey ? toImageKey(template.imageKey) : undefined
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

        const preset = t as keyof typeof TraitPresets;

        const trait = TraitPresets[preset];

        if (!trait) {
            throw new Error(`Unknown trait: ${t}`);
        }

        return trait;
    });

}

function toAiType(ai: string): AiType {

    const value = AiType[ai as keyof typeof AiType];

    if (!value) throw new Error(`Invalid AiType: ${ai}`);
    return value;
}

function toImageKey(key: string): ImageKey {
    const imageKey = ImageKey[key as keyof typeof ImageKey];

    if (!imageKey) throw new Error(`invalid ImageKey: ${key}`)
    return imageKey;
}