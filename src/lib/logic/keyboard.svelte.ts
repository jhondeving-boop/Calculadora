import { engine } from '../logic/engine.svelte';
import { programmer } from './programmer.svelte';

const VALID_KEYS = [
  '0','1','2','3','4','5','6','7','8','9','00','.',
  '+','-','*','/','(',')','^','%',
  '=','⌫','AC',
  'sin','cos','tan','ln','log','sqrt','pi','e'
];

const KEY_MAPPINGS: Record<string, string> = {
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
  '*': '×',
  '/': '÷',
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
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '.': '.',
  '+': '+',
  '-': '-',
};

const MODIFIER_KEYS = ['Control', 'Shift', 'Alt', 'Meta', 'Tab', 'CapsLock', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];

export class KeyboardManager {
  pressedKeys = $state<Set<string>>(new Set());

  handleKeydown(event: KeyboardEvent): void {
    if (MODIFIER_KEYS.includes(event.key)) return;
    
    if (engine.mode === 'Converter' || engine.mode === 'Date') return;
    
    if (engine.mode === 'Programmer') {
      const key = event.key.toUpperCase();
      programmer.press(key);
      return;
    }

    const key = event.key;
    let mappedKey = KEY_MAPPINGS[key] ?? key;

    if (!VALID_KEYS.includes(mappedKey)) return;

    this.pressedKeys.add(mappedKey);
    engine.press(mappedKey);

    setTimeout(() => {
      this.pressedKeys.delete(mappedKey);
    }, 150);
  }

  isPressed(key: string): boolean {
    return this.pressedKeys.has(key);
  }

  clearPressed(): void {
    this.pressedKeys.clear();
  }
}

export const keyboard = new KeyboardManager();