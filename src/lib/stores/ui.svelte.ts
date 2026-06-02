/**
 * UI Store
 * Estado de la interfaz: tema, layout, ventana, etc.
 */

import { api } from '../api/tauri';
import { WINDOW_SIZES, STORAGE_KEYS, UI_TIMEOUTS } from '../utils/constants';

export const ui = $state({
  theme: 'dark' as 'dark' | 'light',
  showSidebar: false,
  showScientific: false,
  copied: false,
  alwaysOnTop: true,
  isCompact: true,
  isPro: false,
  compactWidth: WINDOW_SIZES.compact.width,
  compactHeight: WINDOW_SIZES.compact.height,
  normalWidth: WINDOW_SIZES.normal.width,
  normalHeight: WINDOW_SIZES.normal.height,

  /**
   * Toggle entre temas claro/oscuro
   */
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.theme, this.theme);
    }
  },

  /**
   * Toggle del modo siempre visible
   */
  async toggleAlwaysOnTop() {
    const newState = !this.alwaysOnTop;
    try {
      await api.setFloatingMode(newState);
      this.alwaysOnTop = newState;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.pin, String(newState));
      }
    } catch (e) {
      console.error('✗ Failed to toggle floating mode:', e);
    }
  },

  /**
   * Cierra la aplicación
   */
  async closeApp() {
    try {
      await api.closeWindow();
    } catch (e) {
      console.error('✗ Failed to close app:', e);
    }
  },

  /**
   * Toggle entre modo compacto y normal
   */
  async toggleCompact() {
    const nextCompact = !this.isCompact;

    // Recordar tamaño actual
    try {
      const size = await api.getWindowSize();
      if (nextCompact) {
        this.normalWidth = Math.round(size.width) as 380;
        this.normalHeight = Math.round(size.height) as 620;
      } else {
        this.compactWidth = Math.max(WINDOW_SIZES.compact.minWidth, Math.round(size.width)) as 320;
        this.compactHeight = Math.max(WINDOW_SIZES.compact.minHeight, Math.round(size.height)) as 220;
      }
    } catch (e) {
      console.warn('ℹ Failed to capture current window size:', e);
    }

    this.isCompact = nextCompact;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.compact, String(this.isCompact));
      localStorage.setItem(STORAGE_KEYS.compactWidth, String(this.compactWidth));
      localStorage.setItem(STORAGE_KEYS.compactHeight, String(this.compactHeight));
      localStorage.setItem(STORAGE_KEYS.normalWidth, String(this.normalWidth));
      localStorage.setItem(STORAGE_KEYS.normalHeight, String(this.normalHeight));
    }

    // Limpiar estado al entrar en modo compacto
    if (this.isCompact) {
      this.showSidebar = false;
      this.showScientific = false;
    }

    // Cambiar tamaño de ventana
    try {
      if (this.isCompact) {
        await api.resizeWindow(this.compactWidth, this.compactHeight);
      } else {
        await api.resizeWindow(this.normalWidth, this.normalHeight);
      }
    } catch (e) {
      console.error('✗ Failed to resize window:', e);
    }
  },

  /**
   * Toggle del sidebar (solo en modo normal)
   */
  toggleSidebar() {
    if (this.isCompact) {
      this.showSidebar = false;
      return;
    }
    this.showSidebar = !this.showSidebar;
  },

  /**
   * Toggle del panel científico
   */
  toggleScientific() {
    this.showScientific = !this.showScientific;
  },

  /**
   * Marca como copiado al portapapeles
   */
  setCopied(value: boolean) {
    this.copied = value;
  },

  /**
   * Activa modo Pro
   */
  activatePro() {
    this.isPro = true;
  },

  /**
   * Detecta el tema del sistema operativo
   */
  detectSystemTheme() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme = prefersDark ? 'dark' : 'light';
    }
  },

  /**
   * Escucha cambios del tema del sistema
   */
  watchSystemTheme() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (typeof localStorage !== 'undefined' && !localStorage.getItem(STORAGE_KEYS.theme)) {
          this.theme = e.matches ? 'dark' : 'light';
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
      }
    }
  },

  /**
   * Carga preferencias del localStorage
   */
  loadPreferences() {
    if (typeof localStorage === 'undefined') return;

    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if (savedTheme) {
      this.theme = savedTheme as 'dark' | 'light';
    } else {
      this.detectSystemTheme();
      this.watchSystemTheme();
    }

    this.isCompact = true;
    localStorage.setItem(STORAGE_KEYS.compact, 'true');

    const savedPin = localStorage.getItem(STORAGE_KEYS.pin);
    if (savedPin) this.alwaysOnTop = savedPin === 'true';

    const savedCompactWidth = localStorage.getItem(STORAGE_KEYS.compactWidth);
    const savedCompactHeight = localStorage.getItem(STORAGE_KEYS.compactHeight);
    const savedNormalWidth = localStorage.getItem(STORAGE_KEYS.normalWidth);
    const savedNormalHeight = localStorage.getItem(STORAGE_KEYS.normalHeight);

    if (savedCompactWidth) this.compactWidth = (Number(savedCompactWidth) || this.compactWidth) as 320;
    if (savedCompactHeight) this.compactHeight = (Number(savedCompactHeight) || this.compactHeight) as 220;
    if (savedNormalWidth) this.normalWidth = (Number(savedNormalWidth) || this.normalWidth) as 380;
    if (savedNormalHeight) this.normalHeight = (Number(savedNormalHeight) || this.normalHeight) as 620;
  },
});
