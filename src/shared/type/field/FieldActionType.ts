// src/shared/type/field/FieldActionType.ts

export const FieldActionType = {
    ITEM: "ITEM", MAGIC: "MAGIC", EQUIPMENT: "TECNIQUE", SAVE: "SAVE", OPTION: "OPTION"
} as const;
export type FieldActionType = typeof FieldActionType[keyof typeof FieldActionType];
