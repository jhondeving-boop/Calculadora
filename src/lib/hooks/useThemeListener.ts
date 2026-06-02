/**
 * useThemeListener Hook
 * Hook reutilizable para escuchar cambios de tema del sistema operativo
 * y sincronizar con preferencias locales
 */

import { onMount } from 'svelte';
import { STORAGE_KEYS } from '../utils/constants';

export interface UseThemeListenerOptions {
  storageKey?: string;
  onThemeChange?: (theme: 'dark' | 'light') => void;
}

/**
 * Hook que detecta y escucha cambios de tema del sistema
 * 
 * @example
 * ```svelte
 * <script>
 *   import { useThemeListener } from '$lib/hooks/useThemeListener';
 *   
 *   let currentTheme = $state<'dark' | 'light'>('dark');
 *   
 *   useThemeListener({
 *     onThemeChange: (theme) => {
 *       currentTheme = theme;
 *     }
 *   });
 * </script>
 * 
 * <div data-theme={currentTheme}>
 *   Current theme: {currentTheme}
 * </div>
 * ```
 */
export function useThemeListener(options: UseThemeListenerOptions = {}): {
  currentTheme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
} {
  const storageKey = options.storageKey || STORAGE_KEYS.theme;
  let currentTheme: 'dark' | 'light' = 'dark';

  /**
   * Detecta el tema del sistema operativo
   */
  function detectSystemTheme(): 'dark' | 'light' {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'dark';
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  /**
   * Obtiene el tema guardado o detecta el del sistema
   */
  function getInitialTheme(): 'dark' | 'light' {
    // Buscar preferencia guardada
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    }

    // Detectar del sistema
    return detectSystemTheme();
  }

  /**
   * Cambia el tema actual
   */
  function setTheme(theme: 'dark' | 'light') {
    currentTheme = theme;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, theme);
    }

    // Aplicar a documento si existe
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }

    options.onThemeChange?.(theme);
  }

  /**
   * Toggle entre temas
   */
  function toggleTheme() {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  /**
   * Inicializa el hook y escucha cambios del sistema
   */
  onMount(() => {
    // Obtener tema inicial
    currentTheme = getInitialTheme();
    
    // Aplicar tema inicial
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }

    // Escuchar cambios del sistema operativo
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        // Solo aplicar si el usuario no ha seleccionado tema manualmente
        if (typeof localStorage !== 'undefined' && !localStorage.getItem(storageKey)) {
          const newTheme = e.matches ? 'dark' : 'light';
          setTheme(newTheme);
        }
      };

      // Soportar addEventListener (navegadores modernos)
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);

        // Limpiar listener al desmontar
        return () => {
          mediaQuery.removeEventListener('change', handleChange);
        };
      }
      // Fallback para navegadores antiguos
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => {
          mediaQuery.removeListener(handleChange);
        };
      }
    }
  });

  return {
    get currentTheme() {
      return currentTheme;
    },
    toggleTheme,
    setTheme
  };
}

/**
 * Hook para sincronizar tema con elemento del DOM
 * Útil cuando necesitas cambiar data-theme en tiempo real
 */
export function useSyncThemeDOM(theme: 'dark' | 'light') {
  onMount(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  });
}
