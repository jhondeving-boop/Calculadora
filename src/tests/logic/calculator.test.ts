/**
 * Tests para CalculatorLogic Service
 * Validar que las funciones puras funcionen correctamente
 */

import { describe, it, expect } from 'vitest';
import { CalculatorLogic, type CalculatorState } from '$lib/services/CalculatorLogic';

describe('CalculatorLogic', () => {
  // ============ FORMAT TESTS ============
  describe('format()', () => {
    it('should remove trailing zeros after decimal point', () => {
      expect(CalculatorLogic.format(2.5)).toBe('2.5');
      expect(CalculatorLogic.format(2.0)).toBe('2');
      expect(CalculatorLogic.format(2.50000)).toBe('2.5');
    });

    it('should handle integers', () => {
      expect(CalculatorLogic.format(5)).toBe('5');
      expect(CalculatorLogic.format(100)).toBe('100');
    });

    it('should handle small decimals', () => {
      expect(CalculatorLogic.format(0.123)).toBe('0.123');
      expect(CalculatorLogic.format(0.1)).toBe('0.1');
    });
  });

  // ============ OPERATOR DETECTION TESTS ============
  describe('endsWithOperator()', () => {
    it('should detect expressions ending with operators', () => {
      expect(CalculatorLogic.endsWithOperator('5+')).toBe(true);
      expect(CalculatorLogic.endsWithOperator('10-')).toBe(true);
      expect(CalculatorLogic.endsWithOperator('3*')).toBe(true);
      expect(CalculatorLogic.endsWithOperator('8/')).toBe(true);
      expect(CalculatorLogic.endsWithOperator('2^')).toBe(true);
      expect(CalculatorLogic.endsWithOperator('5(')).toBe(true);
    });

    it('should not detect expressions not ending with operators', () => {
      expect(CalculatorLogic.endsWithOperator('5')).toBe(false);
      expect(CalculatorLogic.endsWithOperator('10')).toBe(false);
      expect(CalculatorLogic.endsWithOperator('3.14')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(CalculatorLogic.endsWithOperator('')).toBe(false);
      expect(CalculatorLogic.endsWithOperator('*')).toBe(true);
    });
  });

  // ============ PREVIEW UPDATE TESTS ============
  describe('shouldUpdatePreview()', () => {
    const baseState: CalculatorState = {
      expression: '5+3',
      display: '5+3',
      preview: '',
      error: false
    };

    it('should not update preview if expression is "0"', () => {
      const state = { ...baseState, expression: '0' };
      expect(CalculatorLogic.shouldUpdatePreview(state)).toBe(false);
    });

    it('should not update preview if expression is empty', () => {
      const state = { ...baseState, expression: '' };
      expect(CalculatorLogic.shouldUpdatePreview(state)).toBe(false);
    });

    it('should not update preview if there is an error', () => {
      const state = { ...baseState, error: true };
      expect(CalculatorLogic.shouldUpdatePreview(state)).toBe(false);
    });

    it('should not update preview if expression ends with operator', () => {
      const state = { ...baseState, expression: '5+' };
      expect(CalculatorLogic.shouldUpdatePreview(state)).toBe(false);
    });

    it('should update preview for valid expressions', () => {
      expect(CalculatorLogic.shouldUpdatePreview(baseState)).toBe(true);
    });
  });

  // ============ NUMBER KEY HANDLING TESTS ============
  describe('handleNumberKey()', () => {
    const baseState: CalculatorState = {
      expression: '0',
      display: '0',
      preview: '',
      error: false
    };

    it('should replace "0" with first number', () => {
      const result = CalculatorLogic.handleNumberKey(baseState, '5');
      expect(result.expression).toBe('5');
      expect(result.display).toBe('5');
      expect(result.error).toBe(false);
    });

    it('should append numbers to non-zero expression', () => {
      const state = { ...baseState, expression: '5', display: '5' };
      const result = CalculatorLogic.handleNumberKey(state, '3');
      expect(result.expression).toBe('53');
      expect(result.display).toBe('53');
    });

    it('should handle decimal point', () => {
      const state = { ...baseState, expression: '5', display: '5' };
      const result = CalculatorLogic.handleNumberKey(state, '.');
      expect(result.expression).toBe('5.');
      expect(result.display).toBe('5.');
    });

    it('should clear error flag', () => {
      const state = { ...baseState, error: true };
      const result = CalculatorLogic.handleNumberKey(state, '5');
      expect(result.error).toBe(false);
    });
  });

  // ============ OPERATOR KEY HANDLING TESTS ============
  describe('handleOperatorKey()', () => {
    const baseState: CalculatorState = {
      expression: '5',
      display: '5',
      preview: '',
      error: false
    };

    it('should append operator to valid expression', () => {
      const result = CalculatorLogic.handleOperatorKey(baseState, '+');
      expect(result.expression).toBe('5+');
      expect(result.display).toBe('5+');
    });

    it('should not add operator if expression is "0"', () => {
      const state = { ...baseState, expression: '0' };
      const result = CalculatorLogic.handleOperatorKey(state, '+');
      expect(result).toEqual(state);
    });

    it('should not add operator if expression is empty', () => {
      const state = { ...baseState, expression: '' };
      const result = CalculatorLogic.handleOperatorKey(state, '+');
      expect(result).toEqual(state);
    });

    it('should handle multiple operators', () => {
      const state = { ...baseState, expression: '5+3' };
      const result = CalculatorLogic.handleOperatorKey(state, '*');
      expect(result.expression).toBe('5+3*');
    });
  });

  // ============ CLEAR TESTS ============
  describe('clear()', () => {
    const fullState: CalculatorState = {
      expression: '5+3=8',
      display: '8',
      preview: '8',
      error: true
    };

    it('should reset all state to initial values', () => {
      const result = CalculatorLogic.clear(fullState);
      expect(result.expression).toBe('0');
      expect(result.display).toBe('0');
      expect(result.preview).toBe('');
      expect(result.error).toBe(false);
    });
  });

  // ============ BACKSPACE TESTS ============
  describe('backspace()', () => {
    it('should remove last character from expression', () => {
      const state: CalculatorState = {
        expression: '123',
        display: '123',
        preview: '',
        error: false
      };
      const result = CalculatorLogic.backspace(state);
      expect(result.expression).toBe('12');
      expect(result.display).toBe('12');
    });

    it('should clear to "0" if only one character', () => {
      const state: CalculatorState = {
        expression: '5',
        display: '5',
        preview: '',
        error: false
      };
      const result = CalculatorLogic.backspace(state);
      expect(result.expression).toBe('0');
      expect(result.display).toBe('0');
      expect(result.preview).toBe('');
    });

    it('should clear preview after backspace', () => {
      const state: CalculatorState = {
        expression: '5+3',
        display: '5+3',
        preview: '8',
        error: false
      };
      const result = CalculatorLogic.backspace(state);
      expect(result.preview).toBe('');
    });
  });

  // ============ VALIDATION TESTS ============
  describe('isValidExpression()', () => {
    it('should accept valid expressions', () => {
      expect(CalculatorLogic.isValidExpression('5')).toBe(true);
      expect(CalculatorLogic.isValidExpression('5+3')).toBe(true);
      expect(CalculatorLogic.isValidExpression('10-4')).toBe(true);
    });

    it('should reject "0" (empty)', () => {
      expect(CalculatorLogic.isValidExpression('0')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(CalculatorLogic.isValidExpression('')).toBe(false);
    });

    it('should reject expressions ending with operator', () => {
      expect(CalculatorLogic.isValidExpression('5+')).toBe(false);
      expect(CalculatorLogic.isValidExpression('3*')).toBe(false);
    });

    it('should reject whitespace-only strings', () => {
      expect(CalculatorLogic.isValidExpression('   ')).toBe(false);
    });
  });

  // ============ EVALUATION RESPONSE TESTS ============
  describe('handleEvaluationSuccess()', () => {
    const baseState: CalculatorState = {
      expression: '5+3',
      display: '5+3',
      preview: '8',
      error: true
    };

    it('should update state with result', () => {
      const result = CalculatorLogic.handleEvaluationSuccess(baseState, '8', '5+3');
      expect(result.expression).toBe('8');
      expect(result.display).toBe('8');
      expect(result.preview).toBe('');
      expect(result.error).toBe(false);
    });
  });

  describe('handleEvaluationError()', () => {
    const baseState: CalculatorState = {
      expression: '5+3',
      display: '5+3',
      preview: '8',
      error: false
    };

    it('should set error state', () => {
      const result = CalculatorLogic.handleEvaluationError(baseState);
      expect(result.error).toBe(true);
      expect(result.display).toBe('Error');
      expect(result.preview).toBe('');
    });
  });

  // ============ INTEGRATION TESTS ============
  describe('Integration: Full calculation flow', () => {
    it('should handle: 5+3=', () => {
      let state: CalculatorState = {
        expression: '0',
        display: '0',
        preview: '',
        error: false
      };

      // Press 5
      state = CalculatorLogic.handleNumberKey(state, '5');
      expect(state.expression).toBe('5');

      // Press +
      state = CalculatorLogic.handleOperatorKey(state, '+');
      expect(state.expression).toBe('5+');

      // Press 3
      state = CalculatorLogic.handleNumberKey(state, '3');
      expect(state.expression).toBe('5+3');

      // Validate ready to evaluate
      expect(CalculatorLogic.isValidExpression(state.expression)).toBe(true);
    });

    it('should handle: 10*2=', () => {
      let state: CalculatorState = {
        expression: '0',
        display: '0',
        preview: '',
        error: false
      };

      state = CalculatorLogic.handleNumberKey(state, '1');
      state = CalculatorLogic.handleNumberKey(state, '0');
      state = CalculatorLogic.handleOperatorKey(state, '*');
      state = CalculatorLogic.handleNumberKey(state, '2');

      expect(state.expression).toBe('10*2');
      expect(CalculatorLogic.isValidExpression(state.expression)).toBe(true);
    });

    it('should handle backspace correctly', () => {
      let state: CalculatorState = {
        expression: '0',
        display: '0',
        preview: '',
        error: false
      };

      state = CalculatorLogic.handleNumberKey(state, '5');
      state = CalculatorLogic.handleOperatorKey(state, '+');
      state = CalculatorLogic.handleNumberKey(state, '3');
      expect(state.expression).toBe('5+3');

      state = CalculatorLogic.backspace(state);
      expect(state.expression).toBe('5+');
      expect(state.preview).toBe('');

      state = CalculatorLogic.backspace(state);
      expect(state.expression).toBe('5');

      state = CalculatorLogic.clear(state);
      expect(state.expression).toBe('0');
    });
  });
});
