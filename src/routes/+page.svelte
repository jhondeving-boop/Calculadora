<script lang="ts">
  import { onMount } from "svelte";
  import { slide, fade } from "svelte/transition";
  import { ui, engine, keyboard, programmer } from "$lib/stores";
  import { listen } from "@tauri-apps/api/event";
  import { api } from "$lib/api/tauri";
  import { UI_TIMEOUTS } from "$lib/utils/constants";
  import type { AppMode } from "$lib/types/calculator";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import ConverterView from "$lib/components/ConverterView.svelte";
  import ProgrammerView from "$lib/components/ProgrammerView.svelte";
  import DateView from "$lib/components/DateView.svelte";
  import SyntaxExpression from "$lib/components/SyntaxExpression.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Keypad from "$lib/components/Keypad.svelte";

  onMount(async () => {
    // Cargar preferencias guardadas
    ui.loadPreferences();

    // Registrar atajos globales
    try {
      await api.registerGlobalShortcut();
      await listen('toggle-compact', () => {
        ui.toggleCompact();
      });
    } catch (e) {
      console.warn('ℹ Shortcuts/Events setup failed:', e);
    }

    // Esperar a que Tauri esté listo, luego mostrar ventana
    setTimeout(async () => {
      try {
        // En Linux/Hyprland, el estado inicial de floating/pin debe sincronizarse explícitamente
        if (ui.alwaysOnTop) {
          await api.setFloatingMode(true);
        }
        
        ui.showSidebar = false;
        ui.isCompact = true;
        await api.resizeWindow(ui.compactWidth, ui.compactHeight);
        await api.showWindow();
        console.log('✓ App initialized and window shown');
      } catch (e) {
        console.warn('ℹ Initial window setup failed:', e);
      }
    }, UI_TIMEOUTS.windowInitialization);
  });

  async function copyToClipboard() {
    const val = engine.mode === 'Programmer' ? programmer.input : engine.display;
    if (val === "0") return;
    try {
      await navigator.clipboard.writeText(val);
      ui.setCopied(true);
      setTimeout(() => ui.setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  }

  function applyHistoryEntry(expression: string, result: string) {
    engine.expression = expression;
    engine.display = result;
    engine.preview = "";
    engine.error = false;
    engine.mode = "Standard";
  }

  function handleKeydown(event: KeyboardEvent) {
    if (engine.mode === 'Converter' || engine.mode === 'Date') return;
    if (engine.mode === 'Programmer') {
      programmer.press(event.key.toUpperCase());
      return;
    }
    keyboard.handleKeydown(event);
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="app-shell" data-theme={ui.theme}>
  <div class="layout">
    {#if ui.showSidebar}
      <button 
        type="button"
        class="sidebar-backdrop" 
        onclick={() => ui.toggleSidebar()} 
        onkeydown={(e) => { if (e.key === 'Escape') ui.toggleSidebar() }}
        in:fade={{duration: 250}} 
        out:fade={{duration: 200}}
        aria-label="Cerrar sidebar"
      ></button>
    {/if}

    <Sidebar 
      isOpen={ui.showSidebar} 
      toggleSidebar={() => ui.toggleSidebar()}
      onSelectMode={(m: AppMode) => { engine.mode = m; }} 
    />

    <main class="main-view" class:is-compact={ui.isCompact}>
      <header class="top-nav" data-tauri-drag-region>
        <div class="mode-info">
          {#if !ui.isCompact}
            <span class="mode-label" in:fade>{engine.mode}</span>
          {/if}
        </div>
        <div class="header-actions">
          {#if !ui.isCompact}
            <button 
              class="icon-btn" 
              onclick={() => ui.toggleSidebar()}
              title="Abrir menú"
            >
              <Icon name="menu" size={16} strokeWidth={1.8} />
            </button>
          {/if}
          <button 
            class="icon-btn" 
            class:active={ui.isCompact} 
            onclick={() => ui.toggleCompact()}
            title={ui.isCompact ? "Modo normal" : "Modo Compacto (Zen)"}
          >
            <Icon name={ui.isCompact ? "maximize" : "pip"} size={16} strokeWidth={1.8} />
          </button>
          <button 
            class="icon-btn" 
            class:active={ui.alwaysOnTop} 
            onclick={() => ui.toggleAlwaysOnTop()}
            title="Ventana flotante"
          >
            <Icon name="pin" size={16} strokeWidth={1.8} />
          </button>
          <button 
            class="icon-btn close-btn" 
            onclick={() => ui.closeApp()}
            title="Cerrar"
          >
            <Icon name="close" size={16} strokeWidth={1.8} />
          </button>
          {#if !ui.isCompact}
            <button class="theme-toggle" onclick={() => ui.toggleTheme()} in:fade>
              <Icon name={ui.theme === 'dark' ? 'sun' : 'moon'} size={17} strokeWidth={1.8} />
            </button>
          {/if}
        </div>
      </header>

      <div class="content-wrapper">
        {#if engine.mode === 'Date'}
          <div in:fade={{delay: 100}} class="view-container">
            <DateView />
          </div>
        {:else if engine.mode === 'Converter'}
          <div in:fade={{delay: 100}} class="view-container">
            <ConverterView />
          </div>
        {:else if engine.mode === 'Programmer'}
          <div in:fade={{delay: 100}} class="view-container">
            <ProgrammerView />
          </div>
        {:else}
          <div class="view-container" class:compact={ui.isCompact} data-tauri-drag-region={ui.isCompact ? "" : undefined}>
            {#if ui.isCompact}
              <div class="zen-shell">
                <div class="zen-history" aria-label="Historial rápido">
                  <div class="zen-history-header">Historial</div>
                  <div class="zen-history-list custom-scroll">
                    {#if engine.history.length === 0}
                      <span class="zen-history-empty">Sin cálculos recientes</span>
                    {:else}
                      {#each engine.history.slice(0, 8) as entry}
                        <button
                          class="zen-history-item"
                          type="button"
                          onclick={() => applyHistoryEntry(entry.expression, entry.result)}
                          title={`${entry.expression} = ${entry.result}`}
                        >
                          <span class="expr">{entry.expression}</span>
                          <span class="res">= {entry.result}</span>
                        </button>
                      {/each}
                    {/if}
                  </div>
                </div>

                <button 
                  type="button"
                  class="display-container" 
                  class:compact={ui.isCompact}
                  onclick={copyToClipboard} 
                  data-tauri-drag-region={ui.isCompact ? "" : undefined}
                >
                  <div class="main-display">
                    <div class="expression">
                      <SyntaxExpression expression={engine.expression} />
                    </div>
                    <div class="result" class:error={engine.error} class:is-copied={ui.copied}>{engine.display}</div>
                    {#if ui.copied}
                      <div class="copy-toast">Copiado!</div>
                    {/if}
                  </div>
                  {#if engine.preview !== "" && !engine.error}
                    <div class="preview-display">= {engine.preview}</div>
                  {/if}
                </button>
              </div>
            {/if}

            {#if !ui.isCompact}
              <button 
                type="button"
                class="display-container" 
                class:compact={ui.isCompact}
                onclick={copyToClipboard} 
                data-tauri-drag-region={ui.isCompact ? "" : undefined}
              >
                <div class="main-display">
                  <div class="expression">
                    <SyntaxExpression expression={engine.expression} />
                  </div>
                  <div class="result" class:error={engine.error} class:is-copied={ui.copied}>{engine.display}</div>
                  {#if ui.copied}
                    <div class="copy-toast">Copiado!</div>
                  {/if}
                </div>
                {#if engine.preview !== "" && !engine.error}
                  <div class="preview-display">= {engine.preview}</div>
                {/if}
              </button>

              <div transition:slide={{duration: 300}}>
                <Keypad 
                  showScientific={ui.showScientific} 
                  toggleScientific={() => ui.toggleScientific()} 
                />
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </main>
  </div>
</div>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: var(--bg);
    scrollbar-color: var(--border) var(--bg);
    scrollbar-width: thin;
  }

  :global(html::-webkit-scrollbar),
  :global(body::-webkit-scrollbar),
  :global(.content-wrapper::-webkit-scrollbar),
  :global(.view-container::-webkit-scrollbar),
  :global(.zen-history-list::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }

  :global(html::-webkit-scrollbar-track),
  :global(body::-webkit-scrollbar-track),
  :global(.content-wrapper::-webkit-scrollbar-track),
  :global(.view-container::-webkit-scrollbar-track),
  :global(.zen-history-list::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(html::-webkit-scrollbar-thumb),
  :global(body::-webkit-scrollbar-thumb),
  :global(.content-wrapper::-webkit-scrollbar-thumb),
  :global(.view-container::-webkit-scrollbar-thumb),
  :global(.zen-history-list::-webkit-scrollbar-thumb) {
    background: var(--border);
    border-radius: 999px;
    border: 2px solid var(--bg);
  }

  :global(html::-webkit-scrollbar-thumb:hover),
  :global(body::-webkit-scrollbar-thumb:hover),
  :global(.content-wrapper::-webkit-scrollbar-thumb:hover),
  :global(.view-container::-webkit-scrollbar-thumb:hover),
  :global(.zen-history-list::-webkit-scrollbar-thumb:hover) {
    background: var(--muted);
  }

  .app-shell {
    --bg: #09090b;
    --fg: #fafafa;
    --card: #18181b;
    --accent: #ffffff;
    --accent-fg: #09090b;
    --sidebar-bg: rgba(9, 9, 11, 0.98);
    --btn-bg: #18181b;
    --btn-hover: #27272a;
    --btn-active: #ffffff;
    --btn-active-fg: #09090b;
    --op-bg: #27272a;
    --op-fg: #fafafa;
    --op-active: #fafafa;
    --op-active-fg: #09090b;
    --muted: #a1a1aa;
    --border: #27272a;
    background: var(--bg);
    color: var(--fg);
    height: 100vh;
    display: flex;
    flex-direction: column;
    border: none;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
    outline: none !important;
  }

  .app-shell:has(.is-compact) {
    border: none;
    border-radius: 0;
    outline: none !important;
  }

  .app-shell[data-theme="light"] {
    --bg: #ffffff;
    --fg: #09090b;
    --card: #f4f4f5;
    --accent: #09090b;
    --accent-fg: #ffffff;
    --sidebar-bg: rgba(255, 255, 255, 0.98);
    --btn-bg: #f4f4f5;
    --btn-hover: #e4e4e7;
    --btn-active: #09090b;
    --btn-active-fg: #ffffff;
    --op-bg: #e4e4e7;
    --op-fg: #09090b;
    --op-active: #09090b;
    --op-active-fg: #ffffff;
    --muted: #71717a;
    --border: #e4e4e7;
  }

  .layout { 
    flex: 1; 
    display: flex; 
    position: relative; 
    width: 100%;
    height: 100%;
    overflow: hidden; 
  }

  .main-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    padding: 0 16px;
    box-sizing: border-box;
  }

  .top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    flex-shrink: 0;
    min-height: 48px;
  }

  .main-view:has(.view-container.compact) .top-nav {
    padding: 8px 0;
    min-height: 48px;
  }

  .top-nav:has(+ .content-wrapper .view-container.compact) {
     padding: 8px 0;
     min-height: 48px;
  }
  
  /* Selector alternativo para navegadores antiguos */
  .main-view.is-compact .top-nav {
    padding: 8px 0;
    min-height: 48px;
  }

  .mode-label {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    opacity: 0.4;
  }

  .theme-toggle {
    background: var(--btn-bg);
    border: 1.5px solid var(--border);
    padding: 6px;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: all 0.2s;
    color: var(--fg);
  }

  .theme-toggle:hover { border-color: var(--muted); background: var(--btn-hover); }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .icon-btn {
    background: var(--btn-bg);
    border: 1.5px solid var(--border);
    width: 38px;
    height: 38px;
    border-radius: 12px;
    cursor: pointer;
    display: grid;
    place-items: center;
    color: var(--muted);
    transition: all 0.2s;
  }

  .icon-btn:hover { border-color: var(--muted); color: var(--fg); background: var(--btn-hover); }
  .icon-btn.active { background: var(--accent); color: var(--accent-fg); border-color: var(--accent); }

  .close-btn:hover {
    background: #ef4444 !important;
    color: white !important;
    border-color: #ef4444 !important;
  }

  .content-wrapper { flex: 1; display: flex; flex-direction: column; overflow-y: auto; overflow-x: hidden; min-height: 0; }
  .view-container { flex: 1; display: flex; flex-direction: column; padding: 0; min-height: 0; gap: 10px; overflow-y: auto; overflow-x: hidden; }
  .view-container.compact { padding: 0; justify-content: center; }

  .display-container {
    padding: 12px 0;
    text-align: right;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 100px;
    flex-shrink: 0;
    position: relative;
    gap: 6px;
    cursor: pointer;
    background: transparent;
    border: none;
    width: 100%;
    color: inherit;
    box-sizing: border-box;
  }

  .display-container.compact {
    min-height: 0;
    flex: 0.5;
    padding: 10px 0;
  }

  .zen-shell {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    min-height: 0;
    padding: 12px 0;
  }

  .zen-history {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 0;
    margin: 0;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: color-mix(in srgb, var(--card) 85%, transparent);
    flex: 0 0 36%;
  }

  .zen-history-header {
    font-size: 0.64rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    padding: 0 4px;
  }

  .zen-history-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    min-height: 0;
    padding-right: 2px;
  }

  .zen-history-empty {
    font-size: 0.74rem;
    color: var(--muted);
    opacity: 0.8;
    padding: 8px 4px;
  }

  .zen-history-item {
    width: 100%;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--fg);
    border-radius: 10px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .zen-history-item:hover {
    border-color: var(--muted);
    background: var(--btn-hover);
  }

  .zen-history-item .expr {
    font-size: 0.72rem;
    color: var(--muted);
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .zen-history-item .res {
    font-size: 0.92rem;
    font-weight: 700;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .main-display {
    padding: 12px 14px;
    border-radius: 16px;
    transition: background 0.2s;
    text-align: right;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    min-height: 0;
  }
  .main-display:hover { background: var(--card); }

  .expression { font-size: 0.95rem; min-height: 1.4rem; word-break: break-all; color: var(--muted); }
  .view-container.compact .expression { font-size: 0.75rem; min-height: 1rem; }

  .result { font-size: clamp(2rem, 8vw, 3.2rem); font-weight: 800; word-break: break-all; line-height: 1.2; }
  .view-container.compact .result { font-size: 1.5rem; line-height: 1.2; }

  .copy-toast {
    position: absolute;
    right: 0;
    top: -10px;
    font-size: 0.7rem;
    font-weight: 800;
    background: var(--fg);
    color: var(--bg);
    padding: 6px 14px;
    border-radius: 8px;
    animation: toastFade 2s ease-in-out forwards;
  }

  @keyframes toastFade {
    0% { opacity: 0; transform: translateY(10px); }
    15% { opacity: 1; transform: translateY(0); }
    85% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }

  .preview-display {
    font-size: 1.6rem;
    color: var(--muted);
    font-weight: 600;
    opacity: 0.5;
    padding-right: 14px;
    box-sizing: border-box;
  }

  @media (max-height: 760px) {
    .top-nav {
      padding: 0;
    }

    .view-container {
      padding: 2px;
      gap: 8px;
    }

    .zen-shell {
      gap: 8px;
      padding: 2px 8px;
    }

    .display-container {
      min-height: 96px;
      gap: 6px;
      padding: 6px 12px;
    }

    .zen-history {
      gap: 6px;
      padding: 8px;
      flex-basis: 40%;
    }

    .zen-history-item {
      padding: 7px 9px;
    }

    .zen-history-list {
      min-height: 0;
    }

    .preview-display {
      font-size: 1.25rem;
    }
  }

  .sidebar-backdrop {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
    border: none;
    padding: 0;
  }

  @media (max-width: 799px) {
    .sidebar-backdrop {
      display: block;
    }
  }

  @media (hover: none) and (pointer: coarse) {
    .header-actions {
      gap: 10px;
    }

    .icon-btn,
    .theme-toggle {
      width: 44px;
      height: 44px;
      border-radius: 14px;
    }
  }
</style>
