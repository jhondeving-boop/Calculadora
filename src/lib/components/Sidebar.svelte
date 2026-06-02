<script lang="ts">
  import { engine } from '../stores';
  import { api } from '../api/tauri';
  import type { AppMode } from '../types/calculator';
  import Icon from './Icon.svelte';

  let { onSelectMode, isOpen, toggleSidebar } = $props<{ 
    onSelectMode: (mode: AppMode) => void, 
    isOpen: boolean,
    toggleSidebar: () => void
  }>();

  let searchQuery = $state('');
  let isSearchActive = $state(false);

  const primaryModes: { label: string; value: AppMode; icon: any }[] = [
    { label: 'Estándar', value: 'Standard', icon: 'standard' },
    { label: 'Científica', value: 'Scientific', icon: 'scientific' }
  ];

  const utilityModes: { label: string; value: AppMode; icon: any }[] = [
    { label: 'Fechas', value: 'Date', icon: 'calendar' },
    { label: 'Convertidor', value: 'Converter', icon: 'converter' },
    { label: 'Programador', value: 'Programmer', icon: 'programmer' }
  ];

  const filteredHistory = $derived(
    searchQuery 
      ? engine.history.filter(e => 
          e.expression.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.result.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : engine.history
  );

  async function clearHistory() {
    try {
      await api.clearHistory();
      engine.history = [];
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  }
</script>

<aside class="sidebar" class:show={isOpen} aria-label="Navegación principal">
  <!-- Rail -->
  <div class="rail">
    <button class="icon-btn menu-toggle" onclick={toggleSidebar} aria-label="Abrir menú" aria-expanded={isOpen}>
      <Icon name="menu" size={18} strokeWidth={1.8} />
    </button>
    
    <div class="rail-modes">
      {#each [...primaryModes, ...utilityModes] as m}
        <button 
          class="rail-btn" 
          class:active={engine.mode === m.value} 
          onclick={() => onSelectMode(m.value)}
          title={m.label}
          aria-label={m.label}
          aria-pressed={engine.mode === m.value}
        >
          <Icon name={m.icon} size={17} strokeWidth={1.8} />
        </button>
      {/each}
    </div>
  </div>

  <!-- Drawer -->
  <div class="drawer" class:show={isOpen} aria-hidden={!isOpen}>
    <div class="drawer-header">
      <h2>Menú</h2>
      <button class="icon-btn close-btn" onclick={toggleSidebar} aria-label="Cerrar menú">
        <Icon name="close" size={18} strokeWidth={1.8} />
      </button>
    </div>

    <div class="sidebar-content">
      <div class="section">
        <h3>Modos Principales</h3>
        <nav>
          {#each primaryModes as m}
            <button class="mode-btn" class:active={engine.mode === m.value} onclick={() => { onSelectMode(m.value); }}>
              <Icon name={m.icon} size={16} strokeWidth={1.8} /> {m.label}
            </button>
          {/each}
        </nav>
      </div>

      <div class="section">
        <h3>Utilidades</h3>
        <nav>
          {#each utilityModes as m}
            <button class="mode-btn" class:active={engine.mode === m.value} onclick={() => { onSelectMode(m.value); }}>
              <Icon name={m.icon} size={16} strokeWidth={1.8} /> {m.label}
            </button>
          {/each}
        </nav>
      </div>

      <div class="section history">
        <div class="header">
          <h3>Historial</h3>
          <button class="icon-btn" onclick={clearHistory} title="Limpiar historial" aria-label="Limpiar historial">
            <Icon name="trash" size={14} strokeWidth={1.8} />
          </button>
        </div>

        {#if isSearchActive}
          <div class="search-box">
            <input type="text" placeholder="Buscar..." bind:value={searchQuery} />
          </div>
        {/if}
        
        <div class="list custom-scroll">
          {#if filteredHistory.length === 0}
            <p class="empty">{searchQuery ? 'Sin resultados' : 'Vacío'}</p>
          {:else}
            {#each filteredHistory as entry}
              <button class="history-item" onclick={() => { engine.expression = entry.expression; engine.display = entry.expression; engine.mode = 'Standard'; }}>
                <span class="expr">{entry.expression}</span>
                <span class="res">= {entry.result}</span>
              </button>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</aside>

<style>
  /* Base Sidebar - Always in flex layout */
  .sidebar {
    height: 100%;
    display: flex;
    background: var(--sidebar-bg);
    z-index: 50;
    position: relative;
    border-right: 1px solid var(--border);
  }

  /* Rail - Always visible on left side */
  .rail {
    width: 60px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 6px;
    gap: 10px;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
  }

  .rail-modes { 
    display: flex; 
    flex-direction: column; 
    gap: 8px;
    align-items: center;
    width: 100%;
  }

  .rail-btn, .menu-toggle {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: var(--muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .rail-btn:hover, .menu-toggle:hover { background: var(--btn-hover); color: var(--fg); }
  .rail-btn.active { background: var(--fg); color: var(--bg); }
  .menu-toggle { margin-bottom: 4px; }

  /* Drawer - Expandable menu */
  .drawer {
    position: relative;
    width: 0;
    height: 100%;
    background: var(--sidebar-bg);
    flex-shrink: 0;
    transition: width 0.3s cubic-bezier(0.2, 0, 0, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .drawer.show { width: 280px; }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    width: 100%;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 2;
    background: color-mix(in srgb, var(--sidebar-bg) 88%, transparent);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border);
    box-sizing: border-box;
  }

  h2 { font-size: 1rem; margin: 0; font-weight: 700; }

  .sidebar-content {
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 20px;
    width: 100%;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    min-height: 0;
  }

  h3 {
    font-size: 0.63rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--muted);
    margin-bottom: 6px;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--fg);
    font-size: 0.8rem;
    font-weight: 520;
    cursor: pointer;
    width: 100%;
    transition: background 0.2s;
  }

  .mode-btn:hover { background: var(--btn-hover); }
  .mode-btn.active { background: var(--btn-hover); font-weight: 700; }
  
  .section { display: flex; flex-direction: column; flex-shrink: 0; }
  .section.history { display: flex; flex-direction: column; flex-shrink: 0; }
  .header { display: flex; justify-content: space-between; align-items: center; }
  
  .icon-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--muted);
    cursor: pointer;
    border-radius: 6px;
  }

  .icon-btn:hover { color: var(--fg); background: var(--btn-hover); }
  .icon-btn.close-btn:hover { color: #ef4444; }

  .search-box { margin-bottom: 12px; }
  .search-box input {
    width: 100%;
    padding: 8px 12px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--fg);
    font-size: 0.85rem;
    outline: none;
  }

  .list { 
    flex: none;
    overflow: visible;
    display: flex; 
    flex-direction: column; 
    gap: 8px; 
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .history-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--card);
    border: 1px solid var(--border);
    color: var(--fg);
    cursor: pointer;
    transition: background 0.2s;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden; 
  }

  .history-item:hover { background: var(--btn-hover); }
  
  .expr { 
    font-size: 0.72rem; 
    color: var(--muted); 
    margin-bottom: 4px; 
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .res { 
    font-size: 0.95rem; 
    font-weight: 700; 
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .empty { font-size: 0.75rem; color: var(--muted); text-align: center; margin-top: 20px; }

  /* Mobile: Overlay sidebar */
  @media (max-width: 799px) {
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 100;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);
      border: none;
      flex-direction: column;
    }

    .sidebar.show {
      transform: translateX(0);
    }

    .rail {
      display: none;
    }

    .drawer {
      width: 100% !important;
      height: 100%;
      border: none;
    }

    .drawer-header {
      padding: 14px 16px;
    }

    .drawer-header {
      width: 100%;
    }

    .sidebar-content {
      width: 100%;
    }

    .mode-btn {
      min-height: 42px;
      padding: 10px 12px;
      font-size: 0.9rem;
      gap: 12px;
    }

    .icon-btn {
      width: 34px;
      height: 34px;
      border-radius: 8px;
    }

    .history-item {
      padding: 12px 14px;
    }
  }

  @media (hover: none) and (pointer: coarse) {
    .rail-btn, .menu-toggle {
      width: 42px;
      height: 42px;
      border-radius: 11px;
    }

    .mode-btn {
      min-height: 42px;
      padding: 10px 12px;
      font-size: 0.9rem;
      gap: 12px;
    }

    .icon-btn {
      width: 34px;
      height: 34px;
      border-radius: 8px;
    }

    .history-item {
      padding: 12px 14px;
    }
  }
</style>