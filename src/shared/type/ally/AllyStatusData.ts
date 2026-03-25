import { StatusId } from "../../master/battle/StatusPreset";
import { ImageKey } from "../ImageKey";

export interface AllyStatusData {
    instanceId: number;
    name: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    states: { id: StatusId, duration: number, imageKey: ImageKey }[];
};
