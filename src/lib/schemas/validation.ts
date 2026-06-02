/**
 * API Validation Schemas
 * Define esquemas Zod para validar respuestas del backend
 * Garantiza type safety y validación en runtime
 */

import { z } from 'zod';

// ============ CALCULATOR SCHEMAS ============

export const EvaluateResponseSchema = z.object({
  result: z.number(),
  is_error: z.boolean(),
  formatted: z.string(),
});

export type EvaluateResponse = z.infer<typeof EvaluateResponseSchema>;

export const HistoryEntrySchema = z.object({
  id: z.string().optional(),
  expression: z.string(),
  result: z.string(),
  timestamp: z.string().optional(),
  created_at: z.string().optional(),
});

export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

export const HistoryListSchema = z.array(HistoryEntrySchema);

// ============ CONVERSION SCHEMAS ============

export const ConversionResultSchema = z.object({
  result: z.string(),
  expression: z.string().optional(),
});

export type ConversionResult = z.infer<typeof ConversionResultSchema>;

export const ConversionCategorySchema = z.object({
  name: z.string(),
  units: z.record(z.string(), z.number()),
});

export type ConversionCategory = z.infer<typeof ConversionCategorySchema>;

export const ConversionCategoriesSchema = z.array(ConversionCategorySchema);

// ============ PROGRAMMER SCHEMAS ============

export const BaseConversionSchema = z.object({
  hex: z.string(),
  dec: z.string(),
  oct: z.string(),
  bin: z.string(),
});

export type BaseConversion = z.infer<typeof BaseConversionSchema>;

// ============ WINDOW SIZE SCHEMA ============

export const WindowSizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

export type WindowSize = z.infer<typeof WindowSizeSchema>;

// ============ VALIDATION HELPER FUNCTIONS ============

/**
 * Valida una respuesta de evaluación
 * Lanza error si no cumple el esquema
 */
export function validateEvaluateResponse(data: unknown): EvaluateResponse {
  return EvaluateResponseSchema.parse(data);
}

/**
 * Valida una lista de historial
 */
export function validateHistory(data: unknown): HistoryEntry[] {
  return HistoryListSchema.parse(data);
}

/**
 * Valida categorías de conversión
 */
export function validateConversionCategories(data: unknown): ConversionCategory[] {
  return ConversionCategoriesSchema.parse(data);
}

/**
 * Valida resultado de conversión
 */
export function validateConversionResult(data: unknown): ConversionResult {
  return ConversionResultSchema.parse(data);
}

/**
 * Valida conversión de bases
 */
export function validateBaseConversion(data: unknown): BaseConversion {
  return BaseConversionSchema.parse(data);
}

/**
 * Valida tamaño de ventana
 */
export function validateWindowSize(data: unknown): WindowSize {
  return WindowSizeSchema.parse(data);
}

/**
 * Versión safe: retorna null en lugar de lanzar error
 */
export function safeValidateEvaluateResponse(data: unknown): EvaluateResponse | null {
  try {
    return validateEvaluateResponse(data);
  } catch (e) {
    console.error('Invalid EvaluateResponse:', e);
    return null;
  }
}

export function safeValidateHistory(data: unknown): HistoryEntry[] | null {
  try {
    return validateHistory(data);
  } catch (e) {
    console.error('Invalid History:', e);
    return null;
  }
}

export function safeValidateConversionCategories(data: unknown): ConversionCategory[] | null {
  try {
    return validateConversionCategories(data);
  } catch (e) {
    console.error('Invalid ConversionCategories:', e);
    return null;
  }
}
