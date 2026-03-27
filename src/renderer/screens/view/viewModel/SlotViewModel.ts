export type SlotViewModel =
    | {
        id: number;
        label: string;
        isEmpty: true;
    }
    | {
        id: number;
        label: string;
        isEmpty: false;
        level: number;
        playerName: string;
    };
