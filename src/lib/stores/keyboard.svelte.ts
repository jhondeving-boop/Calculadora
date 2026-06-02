/**
 * KeyboardManager Store
 * Gestiona los eventos de teclado y mapeo de teclas
 */

import { engine } from './engine.svelte';
import { programmer } from './programmer.svelte';
import { 
  VALID_CALCULATOR_KEYS, 
  MODIFIER_KEYS, 
  KEY_DISPLAY_MAP 
} from '../utils/constants';

export class KeyboardManager {
  pressedKeys = $state<Set<string>>(new Set());

  /**
   * Maneja eventos de keydown
   */
  handleKeydown(event: KeyboardEvent): void {
    // Ignorar teclas modificadoras
    if (MODIFIER_KEYS.includes(event.key as any)) return;

    // No procesar en modos que no soportan teclado
    if (engine.mode === 'Converter' || engine.mode === 'Date') return;

    if (engine.mode === 'Programmer') {
      const key = event.key.toUpperCase();
      programmer.press(key);
      return;
    }

    const mappedKey = this.mapKey(event.key);
    if (!this.isValidKey(mappedKey)) return;

    this.pressedKeys.add(mappedKey);
    engine.press(mappedKey);

    // Limpiar después de un tiempo
    setTimeout(() => {
      this.pressedKeys.delete(mappedKey);
    }, 100);
  }

  /**
   * Mapea una tecla a su equivalente de calculadora
   */
  private mapKey(key: string): string {
    return KEY_DISPLAY_MAP[key] ?? key;
  }

  /**
   * Verifica si una tecla es válida
   */
  private isValidKey(key: string): boolean {
    return VALID_CALCULATOR_KEYS.includes(key as any);
  }

  /**
   * Limpia todas las teclas presionadas
   */
  clear(): void {
    this.pressedKeys.clear();
  }
}

export const keyboard = new KeyboardManager();
