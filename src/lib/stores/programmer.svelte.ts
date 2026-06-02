/**
 * ProgrammerEngine Store
 * Estado del modo programador (conversión de bases numéricas)
 */

import { api, type BaseConversion } from '../api/tauri';
import { PROGRAMMER_BASES, RADIX_MAP, type ProgrammerBase } from '../utils/constants';

export class ProgrammerEngine {
  currentBase = $state<ProgrammerBase>('DEC');
  input = $state<string>('0');
  hex = $state<string>('');
  dec = $state<string>('');
  oct = $state<string>('');
  bin = $state<string>('');
  loading = $state(false);

  constructor() {
    this.updateConversions();
  }

  /**
   * Actualiza las conversiones de bases
   */
  async updateConversions() {
    if (this.input === '0' || this.input === '') {
      this.hex = '0';
      this.dec = '0';
      this.oct = '0';
      this.bin = '0000';
      return;
    }

    this.loading = true;
    try {
      const result: BaseConversion = await api.convertBase(
        this.input,
        this.currentBase
      );
      this.hex = result.hex;
      this.dec = result.dec;
      this.oct = result.oct;
      this.bin = result.bin;
    } catch (e) {
      console.error('✗ Conversion error:', e);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Presiona una tecla en modo programador
   */
  press(key: string): void {
    if (key === 'AC') {
      this.input = '0';
      this.updateConversions();
      return;
    }

    if (key === '⌫') {
      this.input = this.input.length > 1 ? this.input.slice(0, -1) : '0';
      this.updateConversions();
      return;
    }

    if (!this.isKeyAllowed(key)) return;

    if (this.input === '0') {
      this.input = key;
    } else {
      this.input += key;
    }
    this.updateConversions();
  }

  /**
   * Verifica si una tecla es válida para la base actual
   */
  isKeyAllowed(key: string): boolean {
    const hexKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
    const decKeys = ['2', '3', '4', '5', '6', '7', '8', '9'];
    const binKeys = ['0', '1'];

    if (this.currentBase === 'BIN') return binKeys.includes(key);
    if (this.currentBase === 'OCT') {
      return [...binKeys, '2', '3', '4', '5', '6', '7'].includes(key);
    }
    if (this.currentBase === 'DEC') {
      return [...binKeys, ...decKeys].includes(key);
    }
    return true; // HEX acepta todo
  }

  /**
   * Cambia la base numérica actual
   */
  async setBase(base: ProgrammerBase): Promise<void> {
    const currentRadix = RADIX_MAP[this.currentBase];
    const currentVal = parseInt(this.input, currentRadix);

    this.currentBase = base;

    if (!isNaN(currentVal)) {
      this.input = currentVal.toString(RADIX_MAP[base]).toUpperCase();
    }
    await this.updateConversions();
  }

  /**
   * Limpia el estado
   */
  clear(): void {
    this.input = '0';
    this.updateConversions();
  }
}

export const programmer = new ProgrammerEngine();
