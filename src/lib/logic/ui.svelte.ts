import { api } from "../api/tauri";
import { listen } from "@tauri-apps/api/event";
import { engine } from "./engine.svelte";

export const ui = $state({
  theme: 'dark' as 'dark' | 'light',
  showSidebar: false,
  showScientific: false,
  copied: false,
  alwaysOnTop: true,
  isCompact: true,
  isPro: false,
  compactWidth: 320,
  compactHeight: 220,
  normalWidth: 380,
  normalHeight: 620,

  async initialize() {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('calc_theme');
      if (savedTheme) {
        this.theme = savedTheme as 'dark' | 'light';
      } else {
        // Detectar automáticamente el tema del sistema operativo
        this.detectSystemTheme();
        // Escuchar cambios en las preferencias del sistema
        this.watchSystemTheme();
      }
      
      // Zen always starts as the default experience.
      this.isCompact = true;
      localStorage.setItem('calc_compact', 'true');

      const savedPin = localStorage.getItem('calc_pin');
      if (savedPin) this.alwaysOnTop = savedPin === 'true';

      const savedCompactWidth = localStorage.getItem('calc_compact_width');
      const savedCompactHeight = localStorage.getItem('calc_compact_height');
      const savedNormalWidth = localStorage.getItem('calc_normal_width');
      const savedNormalHeight = localStorage.getItem('calc_normal_height');

      if (savedCompactWidth) this.compactWidth = Number(savedCompactWidth) || this.compactWidth;
      if (savedCompactHeight) this.compactHeight = Number(savedCompactHeight) || this.compactHeight;
      if (savedNormalWidth) this.normalWidth = Number(savedNormalWidth) || this.normalWidth;
      if (savedNormalHeight) this.normalHeight = Number(savedNormalHeight) || this.normalHeight;
    }

    // Registrar atajos globales y escuchar eventos
    try {
      await api.registerGlobalShortcut();
      await listen('toggle-compact', () => {
        this.toggleCompact();
      });
    } catch (e) {
      console.warn('Shortcuts/Events setup failed:', e);
    }

    // Delay para asegurar que Tauri esté listo
    setTimeout(async () => {
      try {
        await api.setFloatingMode(this.alwaysOnTop);
        this.showSidebar = false;
        this.isCompact = true;
        await api.resizeWindow(this.compactWidth, this.compactHeight);
        // Mostrar la ventana después de haber configurado todo
        await api.showWindow();
      } catch (e) {
        console.warn('Initial window setup failed:', e);
      }
    }, 500);
  },

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('calc_theme', this.theme);
    }
  },

  async toggleAlwaysOnTop() {
    const newState = !this.alwaysOnTop;
    try {
      await api.setFloatingMode(newState);
      this.alwaysOnTop = newState;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('calc_pin', String(newState));
      }
    } catch (e) {
      console.error('Failed to toggle floating mode:', e);
    }
  },

  async closeApp() {
    try {
      await api.closeWindow();
    } catch (e) {
      console.error('Failed to close app:', e);
    }
  },

  async toggleCompact() {
    const nextCompact = !this.isCompact;

    // Recordar tamaño actual para restaurar una experiencia consistente.
    try {
      const size = await api.getWindowSize();
      if (nextCompact) {
        this.normalWidth = Math.round(size.width);
        this.normalHeight = Math.round(size.height);
      } else {
        this.compactWidth = Math.max(260, Math.round(size.width));
        this.compactHeight = Math.max(180, Math.round(size.height));
      }
    } catch (e) {
      console.warn('Failed to capture current window size:', e);
    }

    this.isCompact = nextCompact;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('calc_compact', String(this.isCompact));
      localStorage.setItem('calc_compact_width', String(this.compactWidth));
      localStorage.setItem('calc_compact_height', String(this.compactHeight));
      localStorage.setItem('calc_normal_width', String(this.normalWidth));
      localStorage.setItem('calc_normal_height', String(this.normalHeight));
    }
    
    // Si entramos en modo compacto, asegurar que estamos en un modo compatible (Standard o Scientific)
    if (this.isCompact) {
      this.showSidebar = false;
      this.showScientific = false;
      if (engine.mode === 'Date' || engine.mode === 'Converter') {
        engine.mode = 'Standard';
      }
    }
    
    // Cambiar tamaño de ventana según el modo
    try {
      if (this.isCompact) {
        await api.resizeWindow(this.compactWidth, this.compactHeight);
      } else {
        await api.resizeWindow(this.normalWidth, this.normalHeight);
      }
    } catch (e) {
      console.error('Failed to resize window:', e);
    }
  },

  toggleSidebar() {
    if (this.isCompact) {
      this.showSidebar = false;
      return;
    }
    this.showSidebar = !this.showSidebar;
  },

  toggleScientific() {
    this.showScientific = !this.showScientific;
  },

  setCopied(value: boolean) {
    this.copied = value;
  },

  activatePro() {
    this.isPro = true;
  },

  detectSystemTheme() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme = prefersDark ? 'dark' : 'light';
    }
  },

  watchSystemTheme() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        // Solo aplicar cambios del sistema si el usuario no ha seleccionado tema manualmente
        if (typeof localStorage !== 'undefined' && !localStorage.getItem('calc_theme')) {
          this.theme = e.matches ? 'dark' : 'light';
        }
      };
      
      // Soportar addEventListener (navegadores modernos) y addListener (antiguos)
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
      }
    }
  }
});