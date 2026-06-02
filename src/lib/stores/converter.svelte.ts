/**
 * ConverterEngine Store
 * Estado de la conversión de unidades
 */

import { api, type ConversionCategory, type ConversionResult } from '../api/tauri';

export class ConverterEngine {
  category = $state<string>('Longitud');
  fromUnit = $state<string>('Metros');
  toUnit = $state<string>('Kilómetros');
  value = $state<string>('1');
  result = $state<string>('');
  categories = $state<ConversionCategory[]>([]);
  loading = $state(false);

  constructor() {
    this.loadCategories();
  }

  /**
   * Carga las categorías de conversión disponibles
   */
  async loadCategories() {
    try {
      this.categories = await api.getConversionCategories();
      const cat = this.categories.find((c) => c.name === this.category);
      if (cat) {
        const units = Object.keys(cat.units);
        this.fromUnit = units[0];
        this.toUnit = units[1] || units[0];
      }
    } catch (e) {
      console.error('✗ Failed to load categories:', e);
    }
  }

  /**
   * Realiza una conversión
   */
  async convert() {
    this.loading = true;
    try {
      const res = await api.convertUnit(
        parseFloat(this.value) || 0,
        this.category,
        this.fromUnit,
        this.toUnit
      );
      this.result = res.result;
    } catch (e) {
      console.error('✗ Conversion error:', e);
      this.result = 'Error';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Cambia la categoría de conversión
   */
  async setCategory(cat: string) {
    this.category = cat;
    const category = this.categories.find((c) => c.name === cat);
    if (category) {
      const units = Object.keys(category.units);
      this.fromUnit = units[0];
      this.toUnit = units[1] || units[0];
      await this.convert();
    }
  }

  /**
   * Cambia la unidad origen
   */
  async setFromUnit(unit: string) {
    this.fromUnit = unit;
    await this.convert();
  }

  /**
   * Cambia la unidad destino
   */
  async setToUnit(unit: string) {
    this.toUnit = unit;
    await this.convert();
  }

  /**
   * Actualiza el valor a convertir
   */
  async setValue(val: string) {
    this.value = val;
    await this.convert();
  }

  /**
   * Intercambia las unidades origen y destino
   */
  swapUnits() {
    const temp = this.fromUnit;
    this.fromUnit = this.toUnit;
    this.toUnit = temp;
    this.convert();
  }

  /**
   * Obtiene las unidades disponibles para la categoría actual
   */
  getAvailableUnits(): string[] {
    const cat = this.categories.find((c) => c.name === this.category);
    return cat ? Object.keys(cat.units) : [];
  }
}

export const converter = new ConverterEngine();
