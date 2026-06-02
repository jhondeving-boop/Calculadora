<script lang="ts">
  import { programmer } from '../stores';

  const bases: { label: string; value: typeof programmer.currentBase; color: string }[] = [
    { label: 'HEX', value: 'HEX', color: '#f59e0b' },
    { label: 'DEC', value: 'DEC', color: 'var(--accent)' },
    { label: 'OCT', value: 'OCT', color: '#10b981' },
    { label: 'BIN', value: 'BIN', color: '#8b5cf6' }
  ];

  const hexKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
  const keypad = [
    ['7', '8', '9', 'AC'],
    ['4', '5', '6', '⌫'],
    ['1', '2', '3', '0'],
    ['00']
  ];
</script>

<div class="programmer-view">
  <!-- Base Indicators -->
  <div class="base-panel">
    {#each bases as b}
      <button 
        class="base-row" 
        class:active={programmer.currentBase === b.value}
        onclick={() => programmer.setBase(b.value)}
      >
        <span class="base-label" style="--base-color: {b.color}">{b.label}</span>
        <span class="base-value">{programmer[b.value.toLowerCase() as keyof typeof programmer]}</span>
      </button>
    {/each}
  </div>

  <!-- Large Input Display -->
  <div class="main-input">
    <span class="prefix">{programmer.currentBase}:</span>
    <span class="value">{programmer.input}</span>
    <span class="caret"></span>
  </div>

  <!-- Programmer Keypad -->
  <div class="keypad">
    <div class="hex-row">
      {#each hexKeys as key}
        <button 
          class="btn hex" 
          disabled={!programmer.isKeyAllowed(key)}
          onclick={() => programmer.press(key)}
        >
          {key}
        </button>
      {/each}
    </div>

    <div class="standard-grid">
      {#each keypad as row}
        {#each row as key}
          <button 
            class="btn" 
            class:special={key === 'AC' || key === '⌫'}
            disabled={!programmer.isKeyAllowed(key) && key !== 'AC' && key !== '⌫'}
            onclick={() => programmer.press(key)}
          >
            {key}
          </button>
        {/each}
      {/each}
    </div>
  </div>
</div>

<style>
  .programmer-view { display: flex; flex-direction: column; gap: 18px; height: 100%; min-height: 0; overflow-y: auto; overflow-x: hidden; }

  .base-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--card);
    padding: 16px;
    border-radius: 20px;
    border: 1px solid var(--border);
  }

  .base-row {
    display: flex;
    justify-content: space-between;
    background: transparent;
    border: none;
    padding: 8px 12px;
    border-radius: 8px;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .base-row.active { background: var(--btn-hover); color: var(--fg); }

  .base-label { font-size: 0.7rem; font-weight: 800; width: 40px; color: var(--base-color); }
  .base-value { font-size: 0.95rem; font-weight: 600; font-family: monospace; word-break: break-all; text-align: right; }

  .main-input {
    text-align: right;
    padding: 12px;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-end;
  }

  .prefix { font-size: 0.7rem; font-weight: 800; color: var(--muted); text-transform: uppercase; }
  .value { font-size: 2.8rem; font-weight: 800; font-family: monospace; line-height: 1; }

  .keypad { display: flex; flex-direction: column; gap: 10px; flex: 1; min-height: 0; }

  .hex-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
  .standard-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; flex: 1; grid-auto-rows: minmax(54px, 1fr); }

  .btn {
    width: 100%;
    height: 100%;
    border: 1.5px solid var(--border);
    background: var(--btn-bg);
    color: var(--fg);
    border-radius: 14px;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:disabled { opacity: 0.2; cursor: not-allowed; filter: grayscale(1); }
  .btn:hover:not(:disabled) { border-color: var(--muted); background: var(--btn-hover); transform: translateY(-2px); }

  .btn.hex { font-size: 0.9rem; height: 40px; border-radius: 10px; }
  .btn.special { color: var(--muted); font-size: 1rem; }

  .caret { width: 4px; height: 2.8rem; background: var(--accent); position: absolute; right: 20px; bottom: 35px; animation: blink 1s step-end infinite; opacity: 0; }
  @keyframes blink { from, to { opacity: 1; } 50% { opacity: 0; } }

  @media (max-height: 760px) {
    .programmer-view { gap: 12px; }
    .base-panel { padding: 12px; gap: 6px; }
    .main-input { min-height: 60px; padding: 8px; }
    .value { font-size: 2.2rem; }
    .hex-row { gap: 6px; }
    .standard-grid { gap: 8px; grid-auto-rows: minmax(46px, 1fr); }
    .btn { border-radius: 12px; font-size: 1.05rem; }
    .btn.hex { height: 34px; font-size: 0.78rem; }
  }
</style>
