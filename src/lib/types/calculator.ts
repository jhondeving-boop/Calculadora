export type AppMode = "Standard" | "Scientific" | "Date" | "Converter" | "Programmer";

export type ButtonType = "number" | "operator" | "function" | "special" | "equals";

export interface ButtonDefinition {
  label: string;
  type: ButtonType;
  value: string;
  className?: string;
  disabled?: boolean;
}

export const KEYBOARD_MAPPINGS = {
  ENTER: "=",
  BACKSPACE: "⌫",
  ESCAPE: "AC",
  DELETE: "⌫",
} as const;