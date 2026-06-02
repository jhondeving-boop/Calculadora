/**
 * CalculatorEngine Store
 * Estado reactivo de la calculadora con operaciones asincrónicas
 */

import type { AppMode } from '../types/calculator';
import { api, type HistoryEntry, type EvaluateResponse } from '../api/tauri';
import { HISTORY_CONFIG } from '../utils/constants';

export class CalculatorEngine {
  expression = $state('0');
  display = $state('0');
  preview = $state('');
  error = $state(false);
  history = $state<HistoryEntry[]>([]);
  mode = $state<AppMode>('Standard');

  constructor() {
    this.initialize();
  }

  /**
   * Inicialización del store
   */
  private async initialize() {
    await this.loadHistory();
    await this.registerShortcut();
  }

  /**
   * Registra el atajo global de teclado
   */
  private async registerShortcut() {
    try {
      await api.registerGlobalShortcut();
      console.log('✓ Global shortcut Ctrl+Shift+C registered');
    } catch (e) {
      console.log('ℹ Global shortcut not available:', e);
    }
  }

  /**
   * Carga el historial desde el backend
   */
  private async loadHistory() {
    try {
      this.history = await api.getHistory();
    } catch (e) {
      console.error('✗ Failed to load history:', e);
    }
  }

  /**
   * Evalúa una expresión matemática
   */
  async evaluate(expr: string): Promise<EvaluateResponse> {
    return await api.evaluate(expr);
  }

  /**
   * Formatea un número eliminando ceros decimales
   */
  format(n: number): string {
    const s = `${n}`;
    return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
  }

  /**
   * Actualiza la vista previa de resultado
   */
  async updatePreview() {
    if (this.expression === '0' || this.expression === '' || this.error) {
      this.preview = '';
      return;
    }

    try {
      if (/[+\-*/^.(]$/.test(this.expression)) return;
      
      const res = await this.evaluate(this.expression);
      this.preview = !res.is_error ? res.formatted : '';
    } catch {
      this.preview = '';
    }
  }

  /**
   * Presiona una tecla (número, operador, función)
   */
  async press(key: string) {
    if (this.error) this.clear();

    if (key === 'AC') return this.clear();
    if (key === '⌫') return this.backspace();
    if (key === '=') return this.calculate();

    if (this.expression === '0' && !isNaN(Number(key))) {
      this.expression = key;
    } else {
      this.expression += key;
    }

    this.display = this.expression;
    await this.updatePreview();
  }

  /**
   * Calcula el resultado final
   */
  async calculate() {
    try {
      const res = await this.evaluate(this.expression);

      if (res.is_error) {
        this.error = true;
        this.display = 'Error';
        this.preview = '';
        return;
      }

      await this.addHistory(this.expression, res.formatted);

      this.expression = res.formatted;
      this.display = res.formatted;
      this.preview = '';
      this.error = false;
    } catch {
      this.error = true;
      this.display = 'Error';
      this.preview = '';
    }
  }

  /**
   * Añade una entrada al historial
   */
  private async addHistory(expr: string, res: string) {
    try {
      const entry = await api.addHistory(expr, res);
      this.history = [entry, ...this.history].slice(0, HISTORY_CONFIG.maxEntries);
    } catch (e) {
      console.error('✗ Failed to add history:', e);
    }
  }

  /**
   * Limpia la calculadora
   */
  clear() {
    this.expression = '0';
    this.display = '0';
    this.preview = '';
    this.error = false;
  }

  /**
   * Borra el último carácter
   */
  backspace() {
    if (this.expression.length <= 1) {
      this.clear();
    } else {
      this.expression = this.expression.slice(0, -1);
      this.display = this.expression;
      this.updatePreview();
    }
  }

  /**
   * Limpia el historial
   */
  async clearHistoryBackend() {
    try {
      await api.clearHistory();
      this.history = [];
      console.log('✓ History cleared');
    } catch (e) {
      console.error('✗ Failed to clear history:', e);
    }
  }
}

export const engine = new CalculatorEngine();
