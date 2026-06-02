/**
 * Constantes globales de la aplicación
 * Centraliza todos los valores mágicos usados en la app
 */

// ============== WINDOW CONFIGURATION ==============
export const WINDOW_SIZES = {
  compact: { width: 320, height: 220, minWidth: 260, minHeight: 180 },
  normal: { width: 380, height: 620, minWidth: 260, minHeight: 180 },
} as const;

// ============== UI TIMEOUTS ==============
export const UI_TIMEOUTS = {
  clipboard: 2000,
  windowInitialization: 500,
  sidebarAnimation: 250,
  debouncePreview: 300,
} as const;

// ============== KEYBOARD MAPPINGS ==============
export const KEYBOARD_MAPPINGS = {
  ENTER: '=',
  BACKSPACE: '⌫',
  ESCAPE: 'AC',
  DELETE: '⌫',
} as const;

export const KEY_DISPLAY_MAP: Record<string, string> = {
  'Enter': '=',
  'Backspace': '⌫',
  'Escape': 'AC',
  'Delete': '⌫',
  'c': 'AC',
  'C': 'AC',
  'h': '⌫',
  'H': '⌫',
  'r': '√',
  'R': '√',
  'p': 'π',
  'P': 'π',
  '*': '*',
  '/': '/',
  's': 'sin',
  'S': 'sin',
  'o': 'cos',
  'O': 'cos',
  't': 'tan',
  'T': 'tan',
  'l': 'ln',
  'L': 'ln',
  'g': 'log',
  'G': 'log',
  '^': '^',
  '%': '%',
  '(': '(',
  ')': ')',
};

export const VALID_CALCULATOR_KEYS = [
  '0','1','2','3','4','5','6','7','8','9','00','.',
  '+','-','*','/','(',')','^','%',
  '=','⌫','AC',
  'sin','cos','tan','ln','log','sqrt','pi','e'
] as const;

export const MODIFIER_KEYS = [
  'Control', 'Shift', 'Alt', 'Meta', 'Tab', 
  'CapsLock', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
] as const;

// ============== STORAGE KEYS ==============
export const STORAGE_KEYS = {
  theme: 'calc_theme',
  compact: 'calc_compact',
  pin: 'calc_pin',
  compactWidth: 'calc_compact_width',
  compactHeight: 'calc_compact_height',
  normalWidth: 'calc_normal_width',
  normalHeight: 'calc_normal_height',
} as const;

// ============== APP MODES ==============
export const APP_MODES = ['Standard', 'Scientific', 'Date', 'Converter', 'Programmer'] as const;
export type AppMode = typeof APP_MODES[number];

// ============== HISTORY ==============
export const HISTORY_CONFIG = {
  maxEntries: 30,
  persistenceEnabled: true,
} as const;

// ============== PROGRAMMER BASE MODES ==============
export const PROGRAMMER_BASES = ['HEX', 'DEC', 'OCT', 'BIN'] as const;
export type ProgrammerBase = typeof PROGRAMMER_BASES[number];

export const RADIX_MAP: Record<ProgrammerBase, number> = {
  HEX: 16,
  DEC: 10,
  OCT: 8,
  BIN: 2,
} as const;

// ============== REGEX PATTERNS ==============
export const REGEX_PATTERNS = {
  endsWithOperator: /[+\-*/^.(]$/,
  isNumeric: /^\d+\.?\d*$/,
  hasDecimal: /\./,
} as const;

// ============== SCIENTIFIC FUNCTIONS ==============
export const SCIENTIFIC_FUNCTIONS = ['sin', 'cos', 'tan', 'ln', 'log'] as const;
export const SCIENTIFIC_CONSTANTS = ['π', 'e'] as const;
export const ADVANCED_FUNCTIONS = ['(', ')', 'π', 'e', '^'] as const;
