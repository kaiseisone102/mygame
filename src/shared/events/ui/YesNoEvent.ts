// src/shared/events/ui/YesNoEvent.ts
export type YesNoEvent = {
  type: "OPEN_YES_NO";
  message: string;
  onYes: () => void;
  onNo : () => void;
};
