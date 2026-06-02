/**
 * Tauri API Bindings
 * Interfaz tipada para comandos Tauri + validación con Zod
 */

import { invoke } from "@tauri-apps/api/core";
import {
  validateEvaluateResponse,
  validateHistory,
  validateConversionCategories,
  validateConversionResult,
  validateBaseConversion,
  validateWindowSize,
  safeValidateEvaluateResponse,
  safeValidateHistory,
  safeValidateConversionCategories,
} from "../schemas/validation";

export interface EvaluateResponse {
  result: string;
  formatted: string;
  is_error: boolean;
  error_message: string | null;
}

export interface ConversionResult {
  result: string;
  from_unit: string;
  to_unit: string;
  value: number;
}

export interface ConversionCategory {
  name: string;
  units: Record<string, number>;
}

export interface BaseConversion {
  hex: string;
  dec: string;
  oct: string;
  bin: string;
  input_base: string;
  input_value: string;
}

export interface HistoryEntry {
  id: number;
  expression: string;
  result: string;
  timestamp: number;
}

export interface HistoryStats {
  total_entries: number;
  average_expression_length: number;
  first_calculation: number | null;
  last_calculation: number | null;
  most_used_operator: string | null;
}

export interface WindowSize {
  width: number;
  height: number;
}

export const api = {
  evaluate: (expression: string): Promise<EvaluateResponse> =>
    invoke("evaluate", { request: { expression } }),

  convertUnit: (
    value: number,
    category: string,
    fromUnit: string,
    toUnit: string
  ): Promise<ConversionResult> =>
    invoke("convert_unit", {
      request: { value, category, from_unit: fromUnit, to_unit: toUnit },
    }),

  getConversionCategories: (): Promise<ConversionCategory[]> =>
    invoke("get_conversion_categories"),

  convertBase: (value: string, fromBase: string): Promise<BaseConversion> =>
    invoke("convert_base", { request: { value, from_base: fromBase } }),

  addHistory: (expression: string, result: string): Promise<HistoryEntry> =>
    invoke("add_history", { request: { expression, result } }),

  getHistory: (filter?: string, limit?: number): Promise<HistoryEntry[]> =>
    invoke("get_history", { filter: filter ?? null, limit: limit ?? null }),

  clearHistory: (): Promise<void> => invoke("clear_history"),

  deleteHistoryEntry: (id: number): Promise<void> =>
    invoke("delete_history_entry", { id }),

  getHistoryStats: (): Promise<HistoryStats> => invoke("get_history_stats"),

  healthCheck: (): Promise<string> => invoke("health_check"),

  toggleAlwaysOnTop: (): Promise<boolean> => invoke("toggle_always_on_top"),
  isAlwaysOnTop: (): Promise<boolean> => invoke("is_always_on_top"),
  forceAlwaysOnTop: (): Promise<void> => invoke("force_always_on_top"),
  setFloatingMode: (enabled: boolean): Promise<string> => 
    invoke("set_floating_mode", { enabled }),
  resizeWindow: (width: number, height: number): Promise<void> => 
    invoke("resize_window", { width, height }),
  getWindowSize: (): Promise<WindowSize> => invoke("get_window_size"),
  closeWindow: (): Promise<void> => invoke("close_window"),
  registerGlobalShortcut: (): Promise<string> => invoke("register_global_shortcut"),
  showWindow: (): Promise<void> => invoke("show_window"),
  hideWindow: (): Promise<void> => invoke("hide_window"),
};