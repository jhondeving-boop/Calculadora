<script lang="ts">
  import { engine, keyboard } from '../stores';

  let { showScientific, toggleScientific } = $props<{ 
    showScientific: boolean, 
    toggleScientific: () => void 
  }>();

  const standardRows = [
    ["AC", "⌫", "%", "/"],
    ["7", "8", "9", "*"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", "00", ".", "="]
  ];

  const advancedRow = ["sin", "cos", "tan", "ln", "log"];
  const extraAdvanced = ["(", ")", "pi", "e", "^"];

  const activeOperator = $derived.by(() => {
    const lastChar = engine.expression.trim().slice(-1);
    return ["+", "-", "*", "/"].includes(lastChar) ? lastChar : null;
  });
</script>

<div class="keypad">
  {#if engine.mode === 'Scientific' || showScientific}
    <div class="scientific-panel">
      <div class="grid-sci">
        {#each [...advancedRow, ...extraAdvanced] as key}
          <button 
            class="btn sci" 
            class:keyboard-pressed={keyboard.pressedKeys.has(key)}
            onclick={() => engine.press(key)}
          >{key}</button>
        {/each}
      </div>
    </div>
  {/if}

  {#if engine.mode === 'Standard'}
    <div class="row-header">
      <button class="toggle-sci" class:active={showScientific} onclick={toggleScientific}>
        {showScientific ? "Básico" : "Científico"}
      </button>
    </div>
  {/if}

  <div class="grid-standard">
    {#each standardRows as row}
      {#each row as key}
        <button
          class="btn"
          class:op={["/", "*", "-", "+"].includes(key)}
          class:active-op={activeOperator === key}
          class:keyboard-pressed={keyboard.pressedKeys.has(key)}
          class:equals={key === "="}
          class:special={["AC", "⌫", "%"].includes(key)}
          onclick={() => engine.press(key)}
        >
          {key}
        </button>
      {/each}
    {/each}
  </div>
</div>

<style>
  .keypad { display: flex; flex-direction: column; gap: 12px; flex: 1; min-height: 0; padding: 0 0 12px 0; }
  .row-header { display: flex; justify-content: center; margin-bottom: 6px; }
  .toggle-sci {
    background: transparent;
    border: 1.5px solid var(--border);
    color: var(--muted);
    padding: 8px 20px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    cursor: pointer;
  }
  .toggle-sci.active { background: var(--fg); color: var(--bg); }
  .scientific-panel { background: var(--card); border-radius: 20px; padding: 12px; margin-bottom: 8px; border: 1px solid var(--border); }
  .grid-sci { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
  .grid-standard { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; flex: 1; grid-auto-rows: minmax(56px, 1fr); }
  .btn {
    width: 100%;
    height: 100%;
    border: 1.5px solid var(--border);
    background: var(--btn-bg);
    color: var(--fg);
    border-radius: 18px;
    font-size: clamp(1.2rem, 5vw, 1.6rem);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
  }

  .btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .btn:hover { background: var(--btn-hover); border-color: var(--muted); transform: translateY(-3px); }
  .btn:active { background: var(--btn-active); color: var(--btn-active-fg); transform: scale(0.94); }
  .btn.active-op { background: var(--op-active) !important; color: var(--op-active-fg) !important; }
  .btn.keyboard-pressed {
    background: var(--btn-active);
    color: var(--btn-active-fg);
    transform: scale(0.95);
  }
  .btn.sci { font-size: 0.85rem; font-weight: 800; background: var(--btn-bg); border: none; color: var(--muted); height: 42px; }
  .btn.sci:hover { color: var(--fg); background: var(--btn-hover); }
  .btn.op { background: var(--op-bg); color: var(--op-fg); }
  .btn.op:hover { background: var(--op-active); color: var(--op-active-fg); }
  .btn.op:active { background: var(--op-active); color: var(--op-active-fg); }
  .btn.equals { background: var(--accent); color: var(--accent-fg); border: none; font-weight: 800; }
  .btn.equals:hover { opacity: 0.9; }
  .btn.equals:active { opacity: 0.8; }

  @media (max-height: 760px) {
    .keypad { gap: 8px; }
    .scientific-panel { padding: 10px; margin-bottom: 4px; }
    .grid-sci { gap: 8px; }
    .grid-standard { gap: 8px; grid-auto-rows: minmax(48px, 1fr); }
    .btn { border-radius: 14px; font-size: clamp(1rem, 4.6vw, 1.35rem); }
    .btn.sci { height: 36px; font-size: 0.78rem; }
    .row-header { margin-bottom: 2px; }
    .toggle-sci { padding: 6px 14px; }
  }
</style>