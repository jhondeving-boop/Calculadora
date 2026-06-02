/**
 * CalculatorLogic Service
 * Contiene la lógica pura para operaciones de calculadora
 * Funciones sin estado que pueden ser testeadas fácilmente
 */

import { REGEX_PATTERNS } from '../utils/constants';

export interface CalculatorState {
  expression: string;
  display: string;
  preview: string;
  error: boolean;
}

/**
 * Servicios de lógica pura para la calculadora
 * Todas las funciones son puras (no modifican estado externo)
 */
export class CalculatorLogic {
  /**
   * Formatea un número eliminando ceros decimales innecesarios
   */
  static format(n: number): string {
    const s = `${n}`;
    return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
  }

  /**
   * Verifica si una expresión termina con un operador
   */
  static endsWithOperator(expr: string): boolean {
    return REGEX_PATTERNS.endsWithOperator.test(expr);
  }

  /**
   * Verifica si es válido actualizar preview
   */
  static shouldUpdatePreview(state: CalculatorState): boolean {
    if (state.expression === '0' || state.expression === '' || state.error) {
      return false;
    }
    return !this.endsWithOperator(state.expression);
  }

  /**
   * Maneja la presión de una tecla numérica
   */
  static handleNumberKey(current: CalculatorState, key: string): CalculatorState {
    return {
      ...current,
      expression: current.expression === '0' ? key : current.expression + key,
      display: current.expression === '0' ? key : current.expression + key,
      error: false,
    };
  }

  /**
   * Maneja la presión de una tecla de operador
   */
  static handleOperatorKey(current: CalculatorState, key: string): CalculatorState {
    if (current.expression === '' || current.expression === '0') return current;
    return {
      ...current,
      expression: current.expression + key,
      display: current.expression + key,
    };
  }

  /**
   * Limpia el estado
   */
  static clear(current: CalculatorState): CalculatorState {
    return {
      ...current,
      expression: '0',
      display: '0',
      preview: '',
      error: false,
    };
  }

  /**
   * Borra el último carácter
   */
  static backspace(current: CalculatorState): CalculatorState {
    const newExpr = current.expression.length <= 1 
      ? '0' 
      : current.expression.slice(0, -1);
    
    return {
      ...current,
      expression: newExpr,
      display: newExpr,
      preview: '',
    };
  }

  /**
   * Valida si una expresión es válida para evaluar
   */
  static isValidExpression(expr: string): boolean {
    // No vacía, no es "0", no termina con operador
    return expr.trim() !== '' && expr !== '0' && !this.endsWithOperator(expr);
  }

  /**
   * Procesa una respuesta de evaluación
   */
  static handleEvaluationSuccess(
    current: CalculatorState, 
    result: string, 
    originalExpr: string
  ): CalculatorState {
    return {
      ...current,
      expression: result,
      display: result,
      preview: '',
      error: false,
    };
  }

  /**
   * Maneja error de evaluación
   */
  static handleEvaluationError(current: CalculatorState): CalculatorState {
    return {
      ...current,
      error: true,
      display: 'Error',
      preview: '',
    };
  }
}
