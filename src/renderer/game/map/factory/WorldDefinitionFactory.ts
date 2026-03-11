
import { MapJson } from "../../../../shared/Json/map/MapJson";
import { MapId } from "../../../../shared/type/MapId";
import { WorldDefinitionBuilder } from "../builder/WorldDefinitionBuilder ";
import { WorldDefinition } from "../builder/interface/definition/WorldDefinition";
import { MapRegistry } from "../registry/MapRegistry";

export class WorldDefinitionFactory {
    /** World生成 */
    create(mapId: MapId, mapJson: MapJson): WorldDefinition {

        const builder = MapRegistry.get(mapId);

        const base = builder.build();

        return WorldDefinitionBuilder.build(base.world, base.objectLayer, mapJson);
    }
}
